<script setup lang="ts">
import { useOnline } from '@vueuse/core'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import DayTimeline from './components/DayTimeline.vue'
import JournalView from './components/JournalView.vue'
import PlaceFoodPanel from './components/PlaceFoodPanel.vue'
import PlaceParkingPanel from './components/PlaceParkingPanel.vue'
import PlaceWeatherPanel from './components/PlaceWeatherPanel.vue'
import TripRhythmMap from './components/TripRhythmMap.vue'
import { journalRepository } from './repositories/journalRepository'
import { staticTripData } from './repositories/tripRepository'
import { weatherRepository } from './repositories/weatherRepository'
import {
  getPlaceDetailCategories,
  getPlaceDetailLinksByCategory,
  getPlaceDetailSections,
  getPlaceFood,
  getPlaceParking,
  hasPlaceDetails,
} from './services/placeDetails'
import {
  downloadHtml,
  generateStaticTripHtml,
} from './services/staticTripExport'
import { useTripStore } from './stores/trip'
import type {
  IPlace,
  IWeatherReference,
  MainView,
  PlaceDetailCategory,
  PlaceTextCategory,
} from './types'
import {
  getBottomNavVisibility,
  type ScrollDirection,
} from './utils/bottomNav'
import {
  daysUntil,
  getEmptyDaySummary,
  getPlacesForDay,
  GOOGLE_OFFLINE_HELP_URL,
  searchPlaces,
  selectRelevantDay,
} from './utils/trip'

interface IInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const data = staticTripData
const store = useTripStore()
const route = useRoute()
const router = useRouter()
const online = useOnline()
const loading = ref(true)
const dataError = ref('')
const activeView = ref<MainView>('today')
const currentDay = selectRelevantDay(data.days, new Date(), data.trip.timezone)
const currentDayPlaces = getPlacesForDay(data.places, currentDay.day)
const currentDayEmptySummary = getEmptyDaySummary(currentDay, data.places)
const selectedDayNumber = ref(currentDay.day)
const selectedPlace = ref<IPlace | null>(null)
const journalPlace = ref<IPlace | null | undefined>(undefined)
const query = ref('')
const installPrompt = ref<IInstallPromptEvent | null>(null)
const notice = ref('')
const includeJournalsInExport = ref(false)
const exporting = ref(false)
const datePickerExpanded = ref(false)
const focusedPlaceId = ref<string | null>(null)
const focusRequest = ref(0)
const rhythmMapSection = ref<HTMLElement | null>(null)
const rhythmTextSection = ref<HTMLElement | null>(null)
const activeDetailTab = ref<PlaceDetailCategory>('看点')
const weatherReference = ref<IWeatherReference | null>(null)
const bottomNavVisible = ref(true)
let lastScrollY = 0
let scrollDirection: ScrollDirection = null
let directionStartY = 0
let scrollFrame = 0
const detailVisible = computed({
  get: () => Boolean(selectedPlace.value),
  set: (value: boolean) => {
    if (!value) selectedPlace.value = null
  },
})

const { needRefresh, updateServiceWorker } = useRegisterSW({
  // 主动轮询，避免长期停留的页面一直用旧缓存看不到新内容。
  onRegisteredSW: (_url, registration) => {
    if (!registration) return
    window.setInterval(
      () => {
        if (navigator.onLine) void registration.update()
      },
      60 * 1000,
    )
  },
  onRegisterError: () => {
    dataError.value = '离线服务初始化失败，请联网刷新后重试。'
  },
})

const isSkipPage = computed(() => route.path === '/skip')
const selectedDay = computed(
  () =>
    data.days.find((day) => day.day === selectedDayNumber.value) ??
    data.days[0],
)
const dayPlaces = computed(() =>
  getPlacesForDay(data.places, selectedDayNumber.value),
)
const searchResults = computed(() => searchPlaces(data.places, query.value))
const skippedPlaces = computed(() =>
  data.places.filter((place) => place.status === 'skip'),
)
const mainPlaces = computed(() =>
  data.places.filter((place) => place.status === 'visit' && place.day),
)
const completedCount = computed(
  () =>
    mainPlaces.value.filter((place) => store.completedSet.has(place.id)).length,
)
const countdown = computed(() => daysUntil(data.trip.startDate))
const isPreTrip = computed(() => new Date() < new Date(`${data.trip.startDate}T00:00:00+08:00`))
const isInstalled = computed(
  () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone)),
)

const preparationItems = [
  { id: 'maps', label: '在 Google Maps App 下载西澳、塔州、维州离线地图' },
  { id: 'tickets', label: '保存船票、门票、住宿确认单到手机本地' },
  { id: 'car', label: '确认租车跨海、车宿与道路限制条款' },
  { id: 'power', label: '准备车充、充电宝与离线紧急联系方式' },
  { id: 'weather', label: '出发前 7 天复查天气、海况与公园关闭' },
]

function setView(view: MainView): void {
  if (isSkipPage.value) void router.push('/')
  activeView.value = view
  bottomNavVisible.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToTimeline(): void {
  rhythmTextSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function selectDay(day: number): void {
  selectedDayNumber.value = day
  datePickerExpanded.value = false
  focusedPlaceId.value = null
}

async function locatePlaceOnMap(place: IPlace): Promise<void> {
  if (place.lat === null || place.lng === null) return
  focusedPlaceId.value = place.id
  focusRequest.value += 1
  await nextTick()
  rhythmMapSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function locatePlaceInTimeline(placeId: string): Promise<void> {
  focusedPlaceId.value = placeId
  await nextTick()
  window.requestAnimationFrame(() => {
    const target = rhythmTextSection.value?.querySelector<HTMLElement>(
      `[data-place-id="${placeId}"]`,
    )
    if (!target) return
    target.focus({ preventScroll: true })
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function openPlace(place: IPlace): void {
  if (!hasPlaceDetails(place)) return
  activeDetailTab.value = getPlaceDetailCategories(place)[0] ?? '看点'
  selectedPlace.value = place
  void weatherRepository.getWeather(place).then((value) => {
    if (selectedPlace.value?.id === place.id) weatherReference.value = value
  })
}

function openJournal(place?: IPlace): void {
  selectedPlace.value = null
  journalPlace.value = place ?? null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function closeJournal(): void {
  journalPlace.value = undefined
  bottomNavVisible.value = true
}

function updateBottomNavVisibility(): void {
  scrollFrame = 0
  const currentY = Math.max(0, window.scrollY)
  const nextDirection: ScrollDirection =
    currentY > lastScrollY ? 'down' : currentY < lastScrollY ? 'up' : scrollDirection

  if (nextDirection !== scrollDirection) {
    scrollDirection = nextDirection
    directionStartY = lastScrollY
  }

  bottomNavVisible.value = getBottomNavVisibility({
    currentY,
    direction: scrollDirection,
    directionDistance: Math.abs(currentY - directionStartY),
    viewportHeight: window.innerHeight,
    documentHeight: document.documentElement.scrollHeight,
    currentVisible: bottomNavVisible.value,
  })
  lastScrollY = currentY
}

function handleScroll(): void {
  if (scrollFrame) return
  scrollFrame = window.requestAnimationFrame(updateBottomNavVisibility)
}

function detailSection(place: IPlace, tab: PlaceDetailCategory) {
  return getPlaceDetailSections(place).find((section) => section.category === tab)
}

const detailTabs = computed<PlaceDetailCategory[]>(() =>
  selectedPlace.value ? getPlaceDetailCategories(selectedPlace.value) : [],
)
const detailTabLinks = computed(() =>
  selectedPlace.value
    ? getPlaceDetailLinksByCategory(selectedPlace.value, activeDetailTab.value)
    : [],
)
const detailTabItems = computed<string[]>(() => {
  if (!selectedPlace.value || activeDetailTab.value === '美食') return []
  return (
    detailSection(selectedPlace.value, activeDetailTab.value as PlaceTextCategory)
      ?.items ?? []
  )
})
const selectedFood = computed(() =>
  selectedPlace.value ? getPlaceFood(selectedPlace.value) : null,
)
const selectedParking = computed(() =>
  selectedPlace.value ? getPlaceParking(selectedPlace.value) : null,
)

function stripRouteDetail(value: string): string {
  let result = value.trim()
  let previous = ''
  while (result !== previous) {
    previous = result
    result = result.replace(/（[^（）]*）/g, '')
  }
  return result
    .replace(/【[^】]*】/g, '')
    .replace(/\s*T\d\b.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const routeEndpoints = computed(() => {
  const sections = selectedDay.value.route
    .split('→')
    .map(stripRouteDetail)
    .filter(Boolean)
  return {
    start: sections[0] ?? '待确认',
    end: sections.at(-1) ?? sections[0] ?? '待确认',
  }
})

function firstTimePart(value: string): string {
  return value.split(/[-–—]/)[0]?.trim() || '待定'
}

function lastTimePart(value: string): string {
  const parts = value.split(/[-–—]/).map((item) => item.trim()).filter(Boolean)
  return parts.at(-1) || '待定'
}

const routeTimes = computed(() => {
  const rhythm = selectedDay.value.rhythm
  return {
    start: firstTimePart(rhythm[0]?.time ?? ''),
    end: lastTimePart(rhythm.at(-1)?.time ?? ''),
  }
})

async function exportTrip(): Promise<void> {
  if (exporting.value) return
  exporting.value = true
  try {
    const journals = includeJournalsInExport.value
      ? await journalRepository.list()
      : []
    const html = await generateStaticTripHtml(data, journals)
    downloadHtml(html, `澳洲行程路书-${data.trip.startDate}.html`)
    notice.value = `静态路书已生成${journals.length ? '，包含本机随手记' : '，未包含随手记'}`
  } catch {
    notice.value = '静态路书生成失败，请稍后重试'
  } finally {
    exporting.value = false
  }
}

function handleEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape' && detailVisible.value) detailVisible.value = false
}

async function installApp(): Promise<void> {
  if (!installPrompt.value) return
  await installPrompt.value.prompt()
  await installPrompt.value.userChoice
  installPrompt.value = null
}

function applyTheme(): void {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = store.theme === 'dark' || (store.theme === 'system' && prefersDark)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  const background = dark ? '#191b1c' : '#fafaf7'
  document.documentElement.style.backgroundColor = background
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  document.querySelector<HTMLMetaElement>('#theme-color')?.setAttribute('content', background)
}

watch(
  () => store.theme,
  () => applyTheme(),
)

watch(selectedDayNumber, async () => {
  focusedPlaceId.value = null
  await nextTick()
  document
    .querySelector(`[data-day="${selectedDayNumber.value}"]`)
    ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
})

onMounted(() => {
  try {
    if (data.days.length !== 13 || data.places.length < 80) {
      throw new Error('静态数据不完整')
    }
  } catch (error) {
    dataError.value = error instanceof Error ? error.message : '行程数据加载失败'
  } finally {
    window.setTimeout(() => {
      loading.value = false
    }, 350)
  }
  applyTheme()
  lastScrollY = Math.max(0, window.scrollY)
  directionStartY = lastScrollY
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    installPrompt.value = event as IInstallPromptEvent
  })
  window.addEventListener('keydown', handleEscape)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape)
  window.removeEventListener('scroll', handleScroll)
  if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
})
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main">跳到主要内容</a>

    <header class="topbar">
      <div>
        <p class="brand-kicker">2026 澳大利亚自驾</p>
        <h1>{{ isSkipPage ? '本次不看' : '澳洲行程路书' }}</h1>
      </div>
      <button
        class="icon-button"
        type="button"
        aria-label="切换主题"
        @click="
          store.theme =
            store.theme === 'system'
              ? 'dark'
              : store.theme === 'dark'
                ? 'light'
                : 'system'
        "
      >
        <van-icon
          :name="
            store.theme === 'dark'
              ? 'closed-eye'
              : store.theme === 'light'
                ? 'eye-o'
                : 'replay'
          "
        />
      </button>
    </header>

    <div class="status-bar" :class="{ offline: !online }" role="status">
      <van-icon :name="online ? 'passed' : 'warning-o'" />
      <span>{{ online ? '内容已缓存，可离线查看' : '当前离线，外部地图与链接不可用' }}</span>
    </div>

    <div v-if="needRefresh" class="update-banner" role="status">
      <span>新版本已准备好</span>
      <button type="button" @click="updateServiceWorker(true)">立即更新</button>
    </div>

    <div v-if="dataError" class="error-banner" role="alert">
      <van-icon name="warning-o" />
      {{ dataError }}
    </div>

    <main id="main">
      <JournalView
        v-if="journalPlace !== undefined"
        :data="data"
        :place="journalPlace ?? undefined"
        @back="closeJournal"
        @open-place="openJournal"
      />

      <template v-else-if="loading">
        <section class="skeleton hero-skeleton" aria-label="正在加载行程">
          <i />
          <i />
          <i />
        </section>
        <section class="skeleton list-skeleton">
          <i v-for="index in 4" :key="index" />
        </section>
      </template>

      <template v-else-if="isSkipPage">
        <section class="page-intro">
          <button class="text-button" type="button" @click="router.push('/')">
            <van-icon name="arrow-left" /> 返回准备页
          </button>
          <p>
            这些地点保留完整资料，但不进入本次主线。弱化呈现可避免临时加点导致疲劳驾驶。
          </p>
        </section>
        <section class="place-list skip-list" aria-label="本次不看地点">
          <button
            v-for="place in skippedPlaces"
            :key="place.id"
            class="place-row"
            type="button"
            @click="openPlace(place)"
          >
            <span class="place-index"><van-icon name="eye-o" /></span>
            <span>
              <strong>{{ place.name }}</strong>
              <small>{{ place.highlights }}</small>
            </span>
            <van-icon name="arrow" />
          </button>
        </section>
      </template>

      <template v-else>
        <section v-if="activeView === 'today'" class="today-view">
          <div class="trip-hero coordinate-pattern">
            <div>
              <p>{{ data.trip.dates.replace('—', '-') }}</p>
              <h2 v-if="isPreTrip">距离出发还有 {{ countdown }} 天</h2>
              <h2 v-else>今天走第 {{ currentDay.day }} 天</h2>
              <span>{{ currentDay.region }}</span>
            </div>
            <div class="trip-progress" aria-label="行程完成进度">
              <strong>{{ completedCount }}</strong>
              <span>/ {{ mainPlaces.length }} 已完成</span>
            </div>
          </div>

          <section class="quick-actions" aria-label="快捷操作">
            <button type="button" @click="setView('itinerary')">
              <van-icon name="todo-list-o" /> 查看全程
            </button>
            <a
              :href="online ? data.trip.myMapsUrl : undefined"
              :aria-disabled="!online"
              target="_blank"
              rel="noreferrer"
            >
              <van-icon name="map-marked" /> 私人行程地图
            </a>
            <button v-if="installPrompt && !isInstalled" type="button" @click="installApp">
              <van-icon name="down" /> 安装应用
            </button>
            <button type="button" @click="openJournal()">
              <van-icon name="records-o" /> 旅途日志
            </button>
          </section>

          <aside class="map-limit-note">
            <van-icon name="info-o" />
            <p>
              网页和行程内容可离线。Google Maps 导航需提前在 App
              下载对应区域；私人 My Maps 图层需联网，不能离线嵌入。
            </p>
          </aside>

          <div class="today-places">
            <div class="section-heading">
              <h2>{{ isPreTrip ? '首日预览' : '今日行程' }}</h2>
              <button type="button" @click="setView('prepare')">离线准备</button>
            </div>
            <section class="place-list" aria-label="今日地点">
              <button
                v-for="place in currentDayPlaces"
                :key="place.id"
                class="place-row"
                type="button"
                @click="openPlace(place)"
              >
                <span class="place-index">{{ place.sequence ?? '—' }}</span>
                <span>
                  <strong>{{ place.name }}</strong>
                  <small>{{ place.duration }} {{ place.transport }}</small>
                </span>
                <van-icon name="arrow" />
              </button>
              <article
                v-if="currentDayEmptySummary"
                class="empty-day-card"
              >
                <span class="empty-day-icon" aria-hidden="true">
                  <van-icon name="logistics" />
                </span>
                <div>
                  <h3>今天没有澳洲地图点位</h3>
                  <p>{{ currentDayEmptySummary.highlights }}</p>
                  <dl>
                    <div>
                      <dt>交通</dt>
                      <dd>{{ currentDayEmptySummary.route }}</dd>
                    </div>
                    <div>
                      <dt>住宿</dt>
                      <dd>{{ currentDayEmptySummary.lodging }}</dd>
                    </div>
                  </dl>
                  <details>
                    <summary>查看当日完整安排</summary>
                    <p>{{ currentDayEmptySummary.schedule }}</p>
                  </details>
                </div>
              </article>
            </section>
          </div>
        </section>

        <section v-else-if="activeView === 'itinerary'" class="itinerary-view">
          <div class="date-picker">
            <section class="day-summary">
              <button
                class="day-selector"
                type="button"
                :aria-expanded="datePickerExpanded"
                aria-controls="trip-date-options"
                @click="datePickerExpanded = !datePickerExpanded"
              >
                <strong>第 {{ selectedDay.day }} 天</strong>
                <span>
                  {{ selectedDay.date.slice(5).replace('-', '/') }}
                  {{ selectedDay.weekday }}
                </span>
                <van-icon :name="datePickerExpanded ? 'arrow-up' : 'arrow-down'" />
              </button>
              <dl>
                <div>
                  <dt>起点</dt>
                  <dd>{{ routeEndpoints.start }}</dd>
                  <time>{{ routeTimes.start }}</time>
                </div>
                <div>
                  <dt>终点</dt>
                  <dd>{{ routeEndpoints.end }}</dd>
                  <time>{{ routeTimes.end }}</time>
                </div>
              </dl>
            </section>
            <div
              v-if="datePickerExpanded"
              id="trip-date-options"
              class="date-strip"
              role="tablist"
              aria-label="选择行程日期"
            >
              <button
                v-for="day in data.days"
                :key="day.day"
                :data-day="day.day"
                :aria-selected="selectedDayNumber === day.day"
                role="tab"
                type="button"
                @click="selectDay(day.day)"
              >
                <small>{{ day.date.slice(5).replace('-', '/') }}</small>
                <strong>{{ day.weekday }}</strong>
              </button>
            </div>
          </div>

          <section class="rhythm-panel" aria-label="行程节奏">
            <section ref="rhythmMapSection" class="rhythm-section rhythm-map-section">
              <TripRhythmMap
                :nodes="selectedDay.rhythm"
                :online="online"
                :focused-place-id="focusedPlaceId"
                :focus-request="focusRequest"
                @select-point="locatePlaceInTimeline"
                @switch-to-text="scrollToTimeline"
              />
            </section>
            <section ref="rhythmTextSection" class="rhythm-section rhythm-text-section">
              <h4>文字</h4>
              <DayTimeline
                :day="selectedDay"
                :places="dayPlaces"
                :online="online"
                :completed-ids="store.completedSet"
                :focused-place-id="focusedPlaceId"
                @open-place="openPlace"
                @open-journal="openJournal"
                @locate-place="locatePlaceOnMap"
              />
            </section>
          </section>

          <details class="day-details">
            <summary>住宿与其他信息</summary>
            <article>
              <h3>住宿</h3>
              <p>{{ selectedDay.lodging }}</p>
              <template v-if="selectedDay.unassigned.booking.length">
                <h3>其他预约与注意事项</h3>
                <p>{{ selectedDay.unassigned.booking.join('\n') }}</p>
              </template>
              <template v-if="selectedDay.unassigned.highlights.length">
                <h3>其他看点与玩法</h3>
                <p>{{ selectedDay.unassigned.highlights.join('\n') }}</p>
              </template>
              <template v-if="selectedDay.unassigned.weather.length">
                <h3>当日通用天气提醒</h3>
                <p>{{ selectedDay.unassigned.weather.join('\n') }}</p>
              </template>
              <div class="link-list">
                <a
                  v-for="link in selectedDay.unassigned.links"
                  :key="link.url"
                  :href="link.url"
                  target="_blank"
                  rel="noreferrer"
                >
                  {{ link.label }} <van-icon name="share-o" />
                </a>
              </div>
            </article>
          </details>

        </section>

        <section v-else-if="activeView === 'search'" class="search-view">
          <label for="global-search">搜索地点、动物、文化或预约信息</label>
          <van-search
            id="global-search"
            v-model="query"
            autofocus
            clearable
            placeholder="例如：袋熊、渡轮、Loch Ard"
          />
          <div v-if="query && !searchResults.length" class="empty-state">
            <van-icon name="search" />
            <h2>没有找到相关内容</h2>
            <p>试试中文名、英文名、动物或交通关键词。</p>
          </div>
          <section v-else class="place-list" aria-live="polite">
            <button
              v-for="place in searchResults"
              :key="place.id"
              class="place-row"
              type="button"
              @click="openPlace(place)"
            >
              <span class="place-index">
                {{ place.day ? `D${place.day}` : '愿望' }}
              </span>
              <span>
                <strong>{{ place.name }}</strong>
                <small>{{ place.highlights }}</small>
              </span>
              <van-icon name="arrow" />
            </button>
          </section>
        </section>

        <section v-else class="prepare-view">
          <button class="journal-overview-link" type="button" @click="openJournal()">
            <span>
              <small>按日期汇总</small>
              <strong>旅途日志</strong>
            </span>
            <van-icon name="arrow" />
          </button>

          <section class="install-card">
            <div>
              <van-icon name="desktop-o" />
              <h2>{{ isInstalled ? '应用已安装' : '安装到手机' }}</h2>
              <p>安装后可从主屏幕打开，核心行程无需网络。</p>
            </div>
            <button
              v-if="installPrompt && !isInstalled"
              type="button"
              @click="installApp"
            >
              安装
            </button>
            <p v-else-if="!isInstalled" class="manual-install">
              iPhone：Safari 分享菜单中选择“添加到主屏幕”。Android：浏览器菜单中选择“安装应用”。
            </p>
          </section>

          <section class="checklist">
            <h2>离线准备检查</h2>
            <label v-for="item in preparationItems" :key="item.id">
              <input
                type="checkbox"
                :checked="store.checklist[item.id]"
                @change="store.toggleChecklist(item.id)"
              />
              <span>{{ item.label }}</span>
            </label>
            <a :href="GOOGLE_OFFLINE_HELP_URL" target="_blank" rel="noreferrer">
              Google Maps 离线地图帮助 <van-icon name="share-o" />
            </a>
          </section>

          <section class="export-card">
            <div>
              <van-icon name="down" />
              <h2>下载静态路书</h2>
              <p>生成一个不依赖网络资源的 HTML，包含 13 天行程、地点资料与来源链接。</p>
            </div>
            <label>
              <input v-model="includeJournalsInExport" type="checkbox">
              包含本机随手记与压缩照片
            </label>
            <small>默认不包含，避免把私人日志带进分享文件。</small>
            <button type="button" :disabled="exporting" @click="exportTrip">
              {{ exporting ? '正在生成…' : '下载 HTML' }}
            </button>
          </section>

          <section class="prepare-groups">
            <details open>
              <summary>必订与住宿交通</summary>
              <p>{{ data.days.map((day) => day.booking).join('\n\n') }}</p>
            </details>
            <details>
              <summary>车宿统一标准</summary>
              <p>{{ data.carStayStandard }}</p>
            </details>
            <details>
              <summary>动物覆盖</summary>
              <p>{{ data.animals }}</p>
            </details>
            <details>
              <summary>待确认事项</summary>
              <ul>
                <li v-for="item in data.pending" :key="item">{{ item }}</li>
              </ul>
            </details>
          </section>

          <button class="skip-page-link" type="button" @click="router.push('/skip')">
            <span>
              <strong>本次不看</strong>
              <small>{{ skippedPlaces.length }} 个保留愿望与完整资料</small>
            </span>
            <van-icon name="arrow" />
          </button>
        </section>
      </template>
    </main>

    <nav
      v-if="!isSkipPage && journalPlace === undefined"
      class="bottom-nav"
      :class="{ 'is-hidden': !bottomNavVisible }"
      :aria-hidden="!bottomNavVisible"
      :inert="!bottomNavVisible"
      aria-label="主要导航"
    >
      <button
        v-for="item in [
          { id: 'today', label: '今天', icon: 'home-o' },
          { id: 'itinerary', label: '日程', icon: 'todo-list-o' },
          { id: 'search', label: '搜索', icon: 'search' },
          { id: 'prepare', label: '准备', icon: 'apps-o' },
        ]"
        :key="item.id"
        :aria-current="activeView === item.id ? 'page' : undefined"
        type="button"
        @click="setView(item.id as MainView)"
      >
        <van-icon :name="item.icon" />
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <van-popup
      v-model:show="detailVisible"
      :style="{ height: '86dvh' }"
      closeable
      close-on-popstate
      position="bottom"
      teleport="body"
      @closed="selectedPlace = null"
    >
      <article v-if="selectedPlace" class="place-detail">
        <header class="detail-header">
          <span>
            {{
              selectedPlace.day
                ? `第 ${selectedPlace.day} 天`
                : selectedPlace.status === 'skip'
                  ? '本次不看'
                  : '路线主题'
            }}
          </span>
          <h2>{{ selectedPlace.name }}</h2>
          <p>{{ selectedPlace.name_en }}</p>
        </header>

        <div
          class="detail-tabs"
          role="tablist"
          :style="{ '--tab-count': detailTabs.length }"
        >
          <button
            v-for="tab in detailTabs"
            :key="tab"
            :aria-selected="activeDetailTab === tab"
            role="tab"
            type="button"
            @click="activeDetailTab = tab"
          >
            {{ tab }}
          </button>
        </div>
        <section class="detail-body">
          <header>
            <small>
              {{
                activeDetailTab === '天气'
                  ? '本目的地气候参考'
                  : activeDetailTab === '美食'
                    ? '附近高分餐厅'
                    : '已按用途整理'
              }}
            </small>
            <h3>{{ activeDetailTab }}</h3>
          </header>

          <PlaceFoodPanel
            v-if="activeDetailTab === '美食' && selectedFood"
            :food="selectedFood"
            :online="online"
          />
          <template v-else-if="activeDetailTab === '天气'">
            <PlaceWeatherPanel
              v-if="weatherReference"
              :place-name="selectedPlace.name"
              :reference="weatherReference"
              :links="detailTabLinks"
              :online="online"
            />
            <div v-else class="detail-empty">正在读取气候参考</div>
          </template>
          <template v-else>
            <div v-if="detailTabItems.length" class="detail-items">
              <p v-for="item in detailTabItems" :key="item">{{ item }}</p>
            </div>
            <div v-else-if="activeDetailTab !== '实用' || !selectedParking" class="detail-empty">
              暂无这一类资料
            </div>
            <PlaceParkingPanel
              v-if="activeDetailTab === '实用' && selectedParking"
              :parking="selectedParking"
              :online="online"
            />
          </template>

          <div
            v-if="detailTabLinks.length && activeDetailTab !== '天气'"
            class="detail-reading"
          >
            <h3>延伸阅读</h3>
            <a
              v-for="link in detailTabLinks"
              :key="link.url"
              :href="link.url"
              target="_blank"
              rel="noreferrer"
            >
              {{ link.label }} <van-icon name="share-o" />
            </a>
          </div>
        </section>

        <footer class="detail-footer">
          <button
            type="button"
            :aria-pressed="store.completedSet.has(selectedPlace.id)"
            @click="store.toggleCompleted(selectedPlace.id)"
          >
            <van-icon :name="store.completedSet.has(selectedPlace.id) ? 'passed' : 'circle'" />
            {{ store.completedSet.has(selectedPlace.id) ? '已完成' : '标记完成' }}
          </button>
        </footer>
      </article>
    </van-popup>

    <div v-if="notice" class="copy-toast" role="status">{{ notice }}</div>
  </div>
</template>

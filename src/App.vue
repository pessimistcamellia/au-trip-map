<script setup lang="ts">
import { useOnline } from '@vueuse/core'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import TripRhythmMap from './components/TripRhythmMap.vue'
import rawTripData from './data/trip-data.json'
import { useTripStore } from './stores/trip'
import type { IPlace, ITripData, MainView } from './types'
import {
  buildNavigationUrl,
  daysUntil,
  getEmptyDaySummary,
  formatCoordinate,
  getPlacesForDay,
  GOOGLE_OFFLINE_HELP_URL,
  searchPlaces,
  selectRelevantDay,
} from './utils/trip'

interface IInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const data = rawTripData as ITripData
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
const query = ref('')
const installPrompt = ref<IInstallPromptEvent | null>(null)
const copyNotice = ref('')
const rhythmView = ref<'text' | 'map'>(
  sessionStorage.getItem('au-trip-map:rhythm-view') === 'map' ? 'map' : 'text',
)
const detailTabs = ['实用', '看点', '天气', '文化', '预约', '备注'] as const
const activeDetailTab = ref<(typeof detailTabs)[number]>('实用')
const detailVisible = computed({
  get: () => Boolean(selectedPlace.value),
  set: (value: boolean) => {
    if (!value) selectedPlace.value = null
  },
})

const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegisteredSW: () => undefined,
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
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function setRhythmView(view: 'text' | 'map'): void {
  rhythmView.value = view
  sessionStorage.setItem('au-trip-map:rhythm-view', view)
}

function openPlace(place: IPlace): void {
  activeDetailTab.value = '实用'
  selectedPlace.value = place
}

function openPointInformation(
  place: IPlace,
  tab: (typeof detailTabs)[number],
): void {
  activeDetailTab.value = tab
  selectedPlace.value = place
}

function detailText(place: IPlace, tab: (typeof detailTabs)[number]): string {
  const values = {
    实用: [place.duration, place.transport, place.sections.practical]
      .filter(Boolean)
      .join('\n\n'),
    看点: [
      place.highlights,
      ...(place.dayInfo?.highlights ?? []),
      place.sections.nature,
    ]
      .filter(Boolean)
      .join('\n\n'),
    天气: place.dayInfo?.weather.join('\n') || place.weather,
    文化: place.sections.culture ?? '暂无单独文化补充。',
    预约: [
      ...(place.dayInfo?.booking ?? []),
      place.sections.practical,
      place.sections.suggestion,
    ]
      .filter(Boolean)
      .join('\n\n'),
    备注: store.notes[place.id] || '还没有个人备注。',
  }
  return values[tab] || '暂无内容。'
}

function detailLinks(place: IPlace) {
  return [...place.links, ...(place.dayInfo?.links ?? [])].filter(
    (link, index, links) =>
      links.findIndex((candidate) => candidate.url === link.url) === index,
  )
}

async function copyText(value: string, label: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value)
    copyNotice.value = `${label}已复制`
  } catch {
    copyNotice.value = '复制失败，请长按文本复制'
  }
  window.setTimeout(() => {
    copyNotice.value = ''
  }, 1800)
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
}

watch(
  () => store.theme,
  () => applyTheme(),
)

watch(selectedDayNumber, async () => {
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
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    installPrompt.value = event as IInstallPromptEvent
  })
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
      <template v-if="loading">
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
                v-for="(place, index) in currentDayPlaces"
                :key="place.id"
                class="place-row"
                type="button"
                @click="openPlace(place)"
              >
                <span class="place-index">{{ index + 1 }}</span>
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
          <div class="date-strip" role="tablist" aria-label="选择行程日期">
            <button
              v-for="day in data.days"
              :key="day.day"
              :data-day="day.day"
              :aria-selected="selectedDayNumber === day.day"
              role="tab"
              type="button"
              @click="selectedDayNumber = day.day"
            >
              <small>{{ day.date.slice(5).replace('-', '/') }}</small>
              <strong>{{ day.weekday }}</strong>
            </button>
          </div>

          <section class="day-summary coordinate-pattern">
            <p>第 {{ selectedDay.day }} 天</p>
            <h2>{{ selectedDay.region }}</h2>
            <span>{{ selectedDay.route }}</span>
          </section>

          <section class="rhythm-panel">
            <header class="rhythm-heading">
              <div>
                <p>按当天时间顺序</p>
                <h3>行程节奏</h3>
              </div>
              <div class="rhythm-switch" role="tablist" aria-label="行程节奏视图">
                <button
                  type="button"
                  role="tab"
                  :aria-selected="rhythmView === 'text'"
                  @click="setRhythmView('text')"
                >
                  文字
                </button>
                <button
                  type="button"
                  role="tab"
                  :aria-selected="rhythmView === 'map'"
                  @click="setRhythmView('map')"
                >
                  地图
                </button>
              </div>
            </header>

            <ol v-if="rhythmView === 'text'" class="rhythm-list">
              <li v-for="node in selectedDay.rhythm" :key="node.id">
                <span class="rhythm-order">{{ node.order }}</span>
                <article>
                  <time>{{ node.time }}</time>
                  <strong>{{ node.title }}</strong>
                  <p>{{ node.text }}</p>
                </article>
              </li>
            </ol>
            <TripRhythmMap
              v-else
              :nodes="selectedDay.rhythm"
              :online="online"
              @switch-to-text="setRhythmView('text')"
            />
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

          <section class="timeline" aria-label="当日时间线">
            <article
              v-for="(place, index) in dayPlaces"
              :key="place.id"
              :class="{ done: store.completedSet.has(place.id) }"
            >
              <button
                class="timeline-check"
                type="button"
                :aria-label="
                  store.completedSet.has(place.id)
                    ? `取消完成 ${place.name}`
                    : `标记完成 ${place.name}`
                "
                @click="store.toggleCompleted(place.id)"
              >
                <van-icon
                  :name="store.completedSet.has(place.id) ? 'checked' : 'circle'"
                />
              </button>
              <button class="timeline-content" type="button" @click="openPlace(place)">
                <span v-if="place.priority === 'optional'" class="optional-label">可选</span>
                <strong>{{ place.name }}</strong>
                <small>{{ place.duration }} · {{ place.transport }}</small>
                <p>{{ place.highlights }}</p>
              </button>
              <div class="point-information">
                <button
                  v-if="place.dayInfo?.weather.length || place.weather"
                  class="point-weather"
                  type="button"
                  :aria-label="`查看 ${place.name} 的天气参考`"
                  @click="openPointInformation(place, '天气')"
                >
                  <van-icon name="cloud-o" />
                </button>
                <button
                  type="button"
                  @click="openPointInformation(place, '预约')"
                >
                  预约与注意
                  <van-icon name="arrow" />
                </button>
                <button type="button" @click="openPointInformation(place, '看点')">
                  看点与玩法
                  <van-icon name="arrow" />
                </button>
              </div>
            </article>
          </section>
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

    <nav v-if="!isSkipPage" class="bottom-nav" aria-label="主要导航">
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
      :style="{ height: '92dvh' }"
      closeable
      position="bottom"
      round
      teleport="body"
      @closed="selectedPlace = null"
    >
      <article v-if="selectedPlace" class="place-detail">
        <header class="detail-header coordinate-pattern">
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
          <div class="detail-actions">
            <button
              type="button"
              :aria-pressed="store.favoriteSet.has(selectedPlace.id)"
              @click="store.toggleFavorite(selectedPlace.id)"
            >
              <van-icon
                :name="store.favoriteSet.has(selectedPlace.id) ? 'star' : 'star-o'"
              />
              收藏
            </button>
            <a
              v-if="selectedPlace.lat !== null"
              :href="online ? buildNavigationUrl(selectedPlace) : undefined"
              :aria-disabled="!online"
              target="_blank"
              rel="noreferrer"
            >
              <van-icon name="guide-o" /> 导航
            </a>
            <button
              v-if="selectedPlace.lat !== null"
              type="button"
              @click="copyText(formatCoordinate(selectedPlace), '坐标')"
            >
              <van-icon name="description-o" /> 坐标
            </button>
            <button type="button" @click="copyText(selectedPlace.name, '地点名')">
              <van-icon name="records-o" /> 地点名
            </button>
          </div>
        </header>

        <div class="detail-tabs" role="tablist">
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
          <template v-if="activeDetailTab === '备注'">
            <label for="personal-note">个人备注，仅保存在当前设备</label>
            <textarea
              id="personal-note"
              :value="store.notes[selectedPlace.id]"
              placeholder="记录停车位置、确认号或现场变化"
              @input="
                store.setNote(
                  selectedPlace!.id,
                  ($event.target as HTMLTextAreaElement).value,
                )
              "
            />
          </template>
          <p v-else>{{ detailText(selectedPlace, activeDetailTab) }}</p>
          <div v-if="detailLinks(selectedPlace).length" class="link-list">
            <a
              v-for="link in detailLinks(selectedPlace)"
              :key="link.url"
              :href="link.url"
              target="_blank"
              rel="noreferrer"
            >
              {{ link.label }} <van-icon name="share-o" />
            </a>
          </div>
        </section>
      </article>
    </van-popup>

    <div v-if="copyNotice" class="copy-toast" role="status">{{ copyNotice }}</div>
  </div>
</template>

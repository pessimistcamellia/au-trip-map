<script setup lang="ts">
import { computed } from 'vue'
import { getPlaceCategoryBadge } from '../services/placeCategory'
import { hasPlaceDetails } from '../services/placeDetails'
import type { IPlace, ITripDay } from '../types'
import { buildNavigationUrl } from '../utils/trip'

interface IStop {
  key: string
  time: string
  text: string
  place: IPlace | null
  sequence: number | null
  doing: string
}

function bareText(value: string): string {
  return value.replace(/[\s，。；、（）()·]/g, '')
}

// 节奏文字与看点玩法常有重复表述，重复时只留一条，避免同一句话读两遍。
function distinctDoing(routeText: string, highlights: string): string {
  const doing = highlights.trim()
  if (!doing) return ''
  const route = bareText(routeText)
  const bare = bareText(doing)
  if (!bare || route.includes(bare) || bare.includes(route)) return ''
  return doing
}

const props = defineProps<{
  day: ITripDay
  places: IPlace[]
  online: boolean
  completedIds: Set<string>
}>()

const emit = defineEmits<{
  toggleCompleted: [placeId: string]
  openPlace: [place: IPlace]
  openJournal: [place: IPlace]
}>()

const stops = computed<IStop[]>(() =>
  props.day.rhythm.map((node) => {
    const place = node.placeId
      ? (props.places.find((candidate) => candidate.id === node.placeId) ?? null)
      : null
    return {
      key: node.id,
      time: node.time,
      text: node.text,
      place,
      sequence: place ? (place.sequence ?? node.sequence) : null,
      doing: place ? distinctDoing(node.text, place.highlights) : '',
    }
  }),
)

function badgeOf(place: IPlace) {
  return getPlaceCategoryBadge(place)
}
</script>

<template>
  <ol class="day-timeline">
    <li
      v-for="stop in stops"
      :key="stop.key"
      :class="{
        'is-stop': Boolean(stop.place),
        done: stop.place ? completedIds.has(stop.place.id) : false,
      }"
    >
      <button
        v-if="stop.place"
        class="stop-index"
        type="button"
        :aria-label="
          completedIds.has(stop.place.id)
            ? `取消完成 ${stop.place.name}`
            : `标记完成 ${stop.place.name}`
        "
        :aria-pressed="completedIds.has(stop.place.id)"
        @click="emit('toggleCompleted', stop.place.id)"
      >
        {{ stop.sequence ?? '·' }}
      </button>
      <span v-else class="stop-dot" aria-hidden="true" />

      <div class="stop-body">
        <template v-if="stop.place">
          <div class="stop-head">
            <span
              class="poi-icon"
              :class="`poi-icon-${badgeOf(stop.place).iconKey}`"
              aria-hidden="true"
            />
            <span class="stop-kind">{{ badgeOf(stop.place).label }}</span>
            <time>{{ stop.time }}</time>
            <span v-if="stop.place.priority === 'optional'" class="optional-label">可选</span>
          </div>
          <h4>
            {{ stop.place.name }}
            <a
              v-if="stop.place.lat !== null"
              class="place-navigate"
              :href="online ? buildNavigationUrl(stop.place) : undefined"
              :aria-disabled="!online"
              :aria-label="`在 Google 地图导航到 ${stop.place.name}`"
              :title="online ? '在 Google 地图导航' : '离线状态不可导航'"
              target="_blank"
              rel="noreferrer"
            ><van-icon name="guide-o" /></a>
            <span v-else class="not-mapped">未上图</span>
          </h4>
          <p class="stop-route">{{ stop.text }}</p>
          <p v-if="stop.doing" class="stop-doing">{{ stop.doing }}</p>
          <div class="stop-actions">
            <button
              v-if="hasPlaceDetails(stop.place)"
              type="button"
              @click="emit('openPlace', stop.place)"
            >
              更多
            </button>
            <button class="journal-link" type="button" @click="emit('openJournal', stop.place)">
              <van-icon name="records-o" />
              随手记
            </button>
          </div>
        </template>
        <template v-else>
          <div class="stop-head">
            <time>{{ stop.time }}</time>
          </div>
          <p class="stop-route">{{ stop.text }}</p>
        </template>
      </div>
    </li>
  </ol>
</template>

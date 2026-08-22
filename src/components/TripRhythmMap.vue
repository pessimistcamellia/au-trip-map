<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { IRhythmNode } from '../types'
import {
  calculateMapLabelLayouts,
  calculateMapViewport,
  getMappableRhythmNodes,
  shouldStartMapDrag,
  spreadMapMarkerPositions,
} from '../utils/trip'

interface IMapPoint extends IRhythmNode {
  lat: number
  lng: number
}

interface ICoordinate {
  lat: number
  lng: number
}

interface ITile {
  key: string
  x: number
  y: number
  left: number
  top: number
  url: string
}

const props = defineProps<{
  nodes: IRhythmNode[]
  online: boolean
  focusedPlaceId: string | null
  focusRequest: number
}>()

const emit = defineEmits<{
  switchToText: []
  selectPoint: [placeId: string]
}>()

const TILE_SIZE = 256
const container = ref<HTMLElement | null>(null)
const width = ref(360)
const height = ref(360)
const zoom = ref(8)
const center = ref<ICoordinate>({ lat: -31.95, lng: 115.86 })
const route = ref<ICoordinate[]>([])
const routeState = ref<'idle' | 'loading' | 'road' | 'straight'>('idle')
const tileFailures = ref(0)
const pulsePlaceId = ref<string | null>(null)
const resetNotice = ref('')
const mapInteractive = ref(false)
let resizeObserver: ResizeObserver | null = null
let resetNoticeTimer: number | undefined
let pulseTimer: number | undefined
let drag:
  | { pointerId: number; x: number; y: number; centerX: number; centerY: number }
  | undefined

const points = computed<IMapPoint[]>(() =>
  getMappableRhythmNodes(props.nodes),
)
const missingCount = computed(() => props.nodes.length - points.value.length)
const mapUnavailable = computed(
  () => !props.online || !points.value.length || tileFailures.value >= 4,
)

function clampLatitude(lat: number): number {
  return Math.max(-85.0511, Math.min(85.0511, lat))
}

function worldSize(level = zoom.value): number {
  return TILE_SIZE * 2 ** level
}

function project(coordinate: ICoordinate, level = zoom.value): { x: number; y: number } {
  const size = worldSize(level)
  const latitude = clampLatitude(coordinate.lat)
  const sin = Math.sin((latitude * Math.PI) / 180)
  return {
    x: ((coordinate.lng + 180) / 360) * size,
    y:
      (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size,
  }
}

function unproject(x: number, y: number, level = zoom.value): ICoordinate {
  const size = worldSize(level)
  const lng = (x / size) * 360 - 180
  const n = Math.PI - (2 * Math.PI * y) / size
  return {
    lat: (180 / Math.PI) * Math.atan(Math.sinh(n)),
    lng,
  }
}

const centerPixel = computed(() => project(center.value))

function screenPosition(coordinate: ICoordinate): { left: number; top: number } {
  const point = project(coordinate)
  return {
    left: point.x - centerPixel.value.x + width.value / 2,
    top: point.y - centerPixel.value.y + height.value / 2,
  }
}

const tiles = computed<ITile[]>(() => {
  const minX = Math.floor((centerPixel.value.x - width.value / 2) / TILE_SIZE) - 1
  const maxX = Math.floor((centerPixel.value.x + width.value / 2) / TILE_SIZE) + 1
  const minY = Math.floor((centerPixel.value.y - height.value / 2) / TILE_SIZE) - 1
  const maxY = Math.floor((centerPixel.value.y + height.value / 2) / TILE_SIZE) + 1
  const count = 2 ** zoom.value
  const result: ITile[] = []
  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      if (y < 0 || y >= count) continue
      const wrappedX = ((x % count) + count) % count
      result.push({
        key: `${zoom.value}-${x}-${y}`,
        x: wrappedX,
        y,
        left: x * TILE_SIZE - centerPixel.value.x + width.value / 2,
        top: y * TILE_SIZE - centerPixel.value.y + height.value / 2,
        url: `https://tile.openstreetmap.org/${zoom.value}/${wrappedX}/${y}.png`,
      })
    }
  }
  return result
})

const routePoints = computed(() =>
  route.value
    .map((coordinate) => {
      const position = screenPosition(coordinate)
      return `${position.left},${position.top}`
    })
    .join(' '),
)
const rawMarkerPositions = computed(() =>
  points.value.map((point) => screenPosition(point)),
)
const markerPositions = computed(() =>
  spreadMapMarkerPositions(rawMarkerPositions.value, width.value, height.value, 72),
)
const markerLabelLayouts = computed(() =>
  calculateMapLabelLayouts(
    points.value,
    markerPositions.value,
    width.value,
    height.value,
  ),
)

function fitPoints(): void {
  const viewport = calculateMapViewport(points.value, width.value, height.value)
  if (!viewport) return
  center.value = viewport.center
  zoom.value = viewport.zoom
}

function changeZoom(delta: number): void {
  zoom.value = Math.max(3, Math.min(16, zoom.value + delta))
}

function startDrag(event: PointerEvent): void {
  if (event.pointerType === 'touch' && !mapInteractive.value) return
  if (
    !shouldStartMapDrag(
      mapUnavailable.value,
      Boolean((event.target as HTMLElement).closest('button, a')),
    )
  ) return
  container.value?.setPointerCapture(event.pointerId)
  drag = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    centerX: centerPixel.value.x,
    centerY: centerPixel.value.y,
  }
}

function moveDrag(event: PointerEvent): void {
  if (!drag || drag.pointerId !== event.pointerId) return
  center.value = unproject(
    drag.centerX - (event.clientX - drag.x),
    drag.centerY - (event.clientY - drag.y),
  )
}

function stopDrag(event: PointerEvent): void {
  if (drag?.pointerId === event.pointerId) drag = undefined
}

function wheelZoom(event: WheelEvent): void {
  if (!mapInteractive.value) return
  event.preventDefault()
  changeZoom(event.deltaY > 0 ? -1 : 1)
}

function toggleMapInteraction(): void {
  mapInteractive.value = !mapInteractive.value
  if (!mapInteractive.value) drag = undefined
}

function selectMapPoint(point: IMapPoint): void {
  if (point.placeId) emit('selectPoint', point.placeId)
}

async function loadRoute(): Promise<void> {
  route.value = points.value.map(({ lat, lng }) => ({ lat, lng }))
  routeState.value = points.value.length > 1 ? 'straight' : 'idle'
  if (!props.online || points.value.length < 2) return
  const uniquePoints = points.value.filter(
    (point, index, values) =>
      index === 0 ||
      point.lat !== values[index - 1].lat ||
      point.lng !== values[index - 1].lng,
  )
  if (uniquePoints.length < 2) return
  routeState.value = 'loading'
  const coordinates = uniquePoints.map((point) => `${point.lng},${point.lat}`).join(';')
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`,
    )
    if (!response.ok) throw new Error('route unavailable')
    const result = (await response.json()) as {
      routes?: Array<{ geometry?: { coordinates?: [number, number][] } }>
    }
    const geometry = result.routes?.[0]?.geometry?.coordinates
    if (!geometry?.length) throw new Error('route unavailable')
    route.value = geometry.map(([lng, lat]) => ({ lat, lng }))
    routeState.value = 'road'
  } catch {
    route.value = uniquePoints.map(({ lat, lng }) => ({ lat, lng }))
    routeState.value = 'straight'
  }
}

function resetMap(): void {
  tileFailures.value = 0
  mapInteractive.value = false
  void nextTick(() => {
    fitPoints()
    void loadRoute()
  })
}

function resetToOverview(): void {
  resetMap()
  resetNotice.value = '已回到当日全览'
  window.clearTimeout(resetNoticeTimer)
  resetNoticeTimer = window.setTimeout(() => {
    resetNotice.value = ''
  }, 1600)
}

watch(
  () => [props.nodes, props.online],
  () => resetMap(),
  { deep: true },
)

watch(
  () => [props.focusedPlaceId, props.focusRequest] as const,
  ([placeId]) => {
    if (!placeId) return
    const point = points.value.find((candidate) => candidate.placeId === placeId)
    if (!point) return
    center.value = { lat: point.lat, lng: point.lng }
    pulsePlaceId.value = placeId
    window.clearTimeout(pulseTimer)
    pulseTimer = window.setTimeout(() => {
      pulsePlaceId.value = null
    }, 1100)
  },
)

onMounted(() => {
  resizeObserver = new ResizeObserver(([entry]) => {
    width.value = entry.contentRect.width
    height.value = entry.contentRect.height
    fitPoints()
  })
  if (container.value) resizeObserver.observe(container.value)
  resetMap()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.clearTimeout(resetNoticeTimer)
  window.clearTimeout(pulseTimer)
})
</script>

<template>
  <section class="rhythm-map-shell" aria-label="当日行程地图">
    <div
      ref="container"
      class="rhythm-map"
      :class="{ dragging: drag, interactive: mapInteractive }"
      @pointerdown="startDrag"
      @pointermove="moveDrag"
      @pointerup="stopDrag"
      @pointercancel="stopDrag"
      @wheel="wheelZoom"
    >
      <template v-if="!mapUnavailable">
        <img
          v-for="tile in tiles"
          :key="tile.key"
          class="map-tile"
          :src="tile.url"
          :style="{ left: `${tile.left}px`, top: `${tile.top}px` }"
          alt=""
          draggable="false"
          @error="tileFailures += 1"
        />
        <svg class="map-route" aria-hidden="true">
          <polyline
            v-if="routePoints"
            :points="routePoints"
            :class="{ straight: routeState === 'straight' }"
          />
          <line
            v-for="(position, index) in markerPositions"
            v-show="position.displaced"
            :key="`leader-${points[index].id}`"
            class="map-marker-leader"
            :x1="rawMarkerPositions[index].left"
            :y1="rawMarkerPositions[index].top - 16"
            :x2="position.left"
            :y2="position.top - 16"
          />
          <line
            v-for="(layout, index) in markerLabelLayouts"
            v-show="!layout.anchored"
            :key="`label-leader-${points[index].id}`"
            class="map-label-leader"
            :x1="markerPositions[index].left"
            :y1="markerPositions[index].top - 22"
            :x2="
              layout.align === 'right' ? layout.left : layout.left + layout.width
            "
            :y2="layout.top + layout.height / 2"
          />
        </svg>
        <button
          v-for="(point, index) in points"
          :key="point.id"
          class="map-marker"
          :class="{
            selected: focusedPlaceId === point.placeId,
            pulsing: pulsePlaceId === point.placeId,
            optional: point.priority === 'optional',
          }"
          :style="{
            left: `${markerPositions[index].left}px`,
            top: `${markerPositions[index].top}px`,
          }"
          type="button"
          :aria-label="`第 ${point.sequence ?? index + 1} 点，${point.title}${point.priority === 'optional' ? '，可选' : ''}，定位到文字行程`"
          :aria-pressed="focusedPlaceId === point.placeId"
          @pointerdown.stop
          @click.stop.prevent="selectMapPoint(point)"
        >
          <b>{{ point.sequence ?? index + 1 }}</b>
          <small v-if="point.priority === 'optional'">可选</small>
        </button>
        <span
          v-for="(point, index) in points"
          :key="`label-${point.id}`"
          class="map-place-label"
          :class="markerLabelLayouts[index].align"
          :style="{
            left: `${markerLabelLayouts[index].left}px`,
            top: `${markerLabelLayouts[index].top}px`,
            width: `${markerLabelLayouts[index].width}px`,
          }"
          aria-hidden="true"
        >
          {{ point.title }}
        </span>
        <button
          class="map-fit-button"
          type="button"
          @pointerdown.stop
          @click.stop="resetToOverview"
        >
          <van-icon name="expand-o" />
          回到全览
        </button>
        <button
          class="map-gesture-button"
          type="button"
          :aria-pressed="mapInteractive"
          @pointerdown.stop
          @click.stop="toggleMapInteraction"
        >
          <van-icon :name="mapInteractive ? 'passed' : 'expand-o'" />
          {{ mapInteractive ? '完成' : '操作地图' }}
        </button>
        <div class="map-controls" aria-label="地图缩放">
          <button type="button" aria-label="放大地图" @pointerdown.stop @click.stop="changeZoom(1)">＋</button>
          <button type="button" aria-label="缩小地图" @pointerdown.stop @click.stop="changeZoom(-1)">−</button>
        </div>
        <small class="map-attribution">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>
        </small>
        <div v-if="!mapInteractive" class="map-scroll-hint">
          单指上下滑动页面
        </div>
        <div v-if="resetNotice" class="map-reset-notice" role="status">
          {{ resetNotice }}
        </div>
      </template>
      <div v-else class="map-empty">
        <van-icon :name="online ? 'location-o' : 'warning-o'" />
        <strong>{{ online ? '当天暂无可定位的节奏点' : '地图需联网' }}</strong>
        <p>
          {{ online ? '无坐标节点仍完整保留在文字列表。' : '文字行程已缓存，可继续离线查看。' }}
        </p>
        <button type="button" @click="emit('switchToText')">切回文字</button>
      </div>
    </div>

    <div v-if="!mapUnavailable" class="map-route-state" role="status">
      <span v-if="routeState === 'loading'">正在匹配驾车道路…</span>
      <span v-else-if="routeState === 'road'">路线沿实际驾车道路绘制</span>
      <span v-else-if="routeState === 'straight'">路线服务不可用，当前为直线示意</span>
      <span v-if="missingCount">另有 {{ missingCount }} 条无坐标节奏仅在文字视图显示</span>
    </div>
  </section>
</template>

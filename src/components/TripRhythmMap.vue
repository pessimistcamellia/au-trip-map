<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { IRhythmNode } from '../types'
import { buildNavigationUrl, getMappableRhythmNodes } from '../utils/trip'

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
}>()

const emit = defineEmits<{
  switchToText: []
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
let resizeObserver: ResizeObserver | null = null
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

function fitPoints(): void {
  if (!points.value.length || !width.value || !height.value) return
  const latitudes = points.value.map((point) => point.lat)
  const longitudes = points.value.map((point) => point.lng)
  center.value = {
    lat: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
    lng: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
  }
  for (let level = 14; level >= 3; level -= 1) {
    const projected = points.value.map((point) => project(point, level))
    const spreadX = Math.max(...projected.map((point) => point.x)) -
      Math.min(...projected.map((point) => point.x))
    const spreadY = Math.max(...projected.map((point) => point.y)) -
      Math.min(...projected.map((point) => point.y))
    if (spreadX <= width.value - 96 && spreadY <= height.value - 120) {
      zoom.value = level
      break
    }
  }
}

function changeZoom(delta: number): void {
  zoom.value = Math.max(3, Math.min(16, zoom.value + delta))
}

function startDrag(event: PointerEvent): void {
  if (mapUnavailable.value) return
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
  event.preventDefault()
  changeZoom(event.deltaY > 0 ? -1 : 1)
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
  void nextTick(() => {
    fitPoints()
    void loadRoute()
  })
}

watch(
  () => [props.nodes, props.online],
  () => resetMap(),
  { deep: true },
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

onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<template>
  <section class="rhythm-map-shell" aria-label="当日行程地图">
    <div
      ref="container"
      class="rhythm-map"
      :class="{ dragging: drag }"
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
        </svg>
        <a
          v-for="(point, index) in points"
          :key="point.id"
          class="map-marker"
          :style="{
            left: `${screenPosition(point).left}px`,
            top: `${screenPosition(point).top}px`,
          }"
          :href="buildNavigationUrl(point)"
          target="_blank"
          rel="noreferrer"
          :aria-label="`第 ${index + 1} 点，${point.title}，${point.time}，在 Google 地图导航`"
          @pointerdown.stop
        >
          <b>{{ index + 1 }}</b>
          <span>{{ point.time }}</span>
        </a>
        <div class="map-controls" aria-label="地图缩放">
          <button type="button" aria-label="放大地图" @click="changeZoom(1)">＋</button>
          <button type="button" aria-label="缩小地图" @click="changeZoom(-1)">−</button>
        </div>
        <small class="map-attribution">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>
        </small>
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

import type { IPlace, IRhythmNode, ITripDay } from '../types'

export interface IEmptyDaySummary {
  highlights: string
  lodging: string
  route: string
  schedule: string
}

export interface IMapViewport {
  center: { lat: number; lng: number }
  zoom: number
}

export interface IMarkerPosition {
  left: number
  top: number
  displaced: boolean
}

export function shouldStartMapDrag(
  mapUnavailable: boolean,
  targetIsControl: boolean,
): boolean {
  return !mapUnavailable && !targetIsControl
}

const TILE_SIZE = 256

function projectCoordinate(
  coordinate: { lat: number; lng: number },
  zoom: number,
): { x: number; y: number } {
  const size = TILE_SIZE * 2 ** zoom
  const latitude = Math.max(-85.0511, Math.min(85.0511, coordinate.lat))
  const sin = Math.sin((latitude * Math.PI) / 180)
  return {
    x: ((coordinate.lng + 180) / 360) * size,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size,
  }
}

function unprojectCoordinate(x: number, y: number, zoom: number) {
  const size = TILE_SIZE * 2 ** zoom
  const lng = (x / size) * 360 - 180
  const n = Math.PI - (2 * Math.PI * y) / size
  return { lat: (180 / Math.PI) * Math.atan(Math.sinh(n)), lng }
}

export function calculateMapViewport(
  points: Array<{ lat: number; lng: number }>,
  width: number,
  height: number,
  padding = { horizontal: 72, vertical: 72 },
): IMapViewport | null {
  if (!points.length || width <= 0 || height <= 0) return null
  if (points.length === 1) {
    return { center: { ...points[0] }, zoom: 13 }
  }

  const availableWidth = Math.max(44, width - padding.horizontal * 2)
  const availableHeight = Math.max(44, height - padding.vertical * 2)
  for (let zoom = 16; zoom >= 3; zoom -= 1) {
    const projected = points.map((point) => projectCoordinate(point, zoom))
    const minX = Math.min(...projected.map((point) => point.x))
    const maxX = Math.max(...projected.map((point) => point.x))
    const minY = Math.min(...projected.map((point) => point.y))
    const maxY = Math.max(...projected.map((point) => point.y))
    if (maxX - minX <= availableWidth && maxY - minY <= availableHeight) {
      return {
        center: unprojectCoordinate((minX + maxX) / 2, (minY + maxY) / 2, zoom),
        zoom,
      }
    }
  }
  return { center: { ...points[0] }, zoom: 3 }
}

export function spreadMapMarkerPositions(
  positions: Array<{ left: number; top: number }>,
  width: number,
  height: number,
  minimumDistance = 42,
): IMarkerPosition[] {
  const placed: IMarkerPosition[] = []
  const offsets = Array.from({ length: 25 }, (_, index) => {
    const x = (index % 5) - 2
    const y = Math.floor(index / 5) - 2
    return [x * 44, y * 44]
  }).sort(
    ([leftX, leftY], [rightX, rightY]) =>
      Math.hypot(leftX, leftY) - Math.hypot(rightX, rightY),
  )
  for (const position of positions) {
    const candidate =
      offsets
        .map(([offsetX, offsetY]) => ({
          left: Math.max(24, Math.min(width - 24, position.left + offsetX)),
          top: Math.max(54, Math.min(height - 20, position.top + offsetY)),
          displaced: offsetX !== 0 || offsetY !== 0,
        }))
        .find((item) =>
          placed.every(
            (previous) =>
              Math.hypot(item.left - previous.left, item.top - previous.top) >=
              minimumDistance,
          ),
        ) ?? {
        left: Math.max(24, Math.min(width - 24, position.left)),
        top: Math.max(54, Math.min(height - 20, position.top)),
        displaced: false,
      }
    placed.push(candidate)
  }
  return placed
}

export function getMapLabelSide(
  position: { left: number },
  width: number,
): 'left' | 'right' {
  if (width <= 0) return 'right'
  const edgeGuard = Math.min(120, width * 0.32)
  if (position.left <= edgeGuard) return 'right'
  if (position.left >= width - edgeGuard) return 'left'
  return position.left < width / 2 ? 'right' : 'left'
}

export interface IMapLabelLayout {
  side: 'left' | 'right'
  offsetX: number
  offsetY: number
}

interface ILayoutRect {
  left: number
  top: number
  width: number
  height: number
}

function rectanglesOverlap(left: ILayoutRect, right: ILayoutRect, gap = 4): boolean {
  return !(
    left.left + left.width + gap <= right.left ||
    right.left + right.width + gap <= left.left ||
    left.top + left.height + gap <= right.top ||
    right.top + right.height + gap <= left.top
  )
}

function estimateMapLabelSize(title: string): { width: number; height: number } {
  const textUnits = [...title].reduce(
    (total, character) =>
      total + (/[\u2E80-\u9FFF]/u.test(character) ? 1 : 0.58),
    0,
  )
  const contentWidth = textUnits * 14
  const width = Math.min(118, Math.max(52, contentWidth + 16))
  return {
    width,
    height: contentWidth > width - 16 ? 47 : 30,
  }
}

export function calculateMapLabelLayouts(
  points: Array<{ title: string }>,
  positions: Array<{ left: number; top: number }>,
  width: number,
  height: number,
): IMapLabelLayout[] {
  const placed: ILayoutRect[] = []
  const layouts = Array<IMapLabelLayout>(points.length)
  const markerRects = positions.map((position) => ({
    left: position.left - 22,
    top: position.top - 44,
    width: 44,
    height: 44,
  }))
  const placementOrder = positions
    .map((position, index) => ({ index, top: position.top }))
    .sort((left, right) => left.top - right.top)
  for (const { index } of placementOrder) {
    const point = points[index]
    const position = positions[index]
    const size = estimateMapLabelSize(point.title)
    const preferred = getMapLabelSide(position, width)
    const alternate = preferred === 'left' ? 'right' : 'left'
    const verticalOffsets = [
      0, -24, 24, -48, 48, -72, 72, -96, 96, -120, 120, -144, 144, -168,
      168,
    ]
    const candidates: IMapLabelLayout[] = verticalOffsets.flatMap(
      (offsetY) => [
        { side: preferred, offsetX: 0, offsetY },
        { side: alternate, offsetX: 0, offsetY },
        {
          side: 'right' as const,
          offsetX: 4 - (position.left + 23),
          offsetY,
        },
        {
          side: 'left' as const,
          offsetX: width - 4 + 23 - position.left,
          offsetY,
        },
      ],
    )
    let selected: IMapLabelLayout | undefined
    let selectedWasPlaced = false
    for (const candidate of candidates) {
      const { side, offsetX, offsetY } = candidate
      const rect = {
        left:
          side === 'right'
            ? position.left + offsetX + 23
            : position.left + offsetX - 23 - size.width,
        top: position.top - 27 + offsetY - size.height / 2,
        ...size,
      }
      const inBounds =
        rect.left >= 4 &&
        rect.left + rect.width <= width - 4 &&
        rect.top >= 4 &&
        rect.top + rect.height <= height - 4
      const avoidsLabels = placed.every(
        (previous) => !rectanglesOverlap(rect, previous),
      )
      const avoidsOtherMarkers = markerRects.every(
        (marker) => !rectanglesOverlap(rect, marker, 1),
      )
      if (inBounds && avoidsLabels && avoidsOtherMarkers) {
        placed.push(rect)
        selected = candidate
        selectedWasPlaced = true
        break
      }
    }
    selected ??= { side: preferred, offsetX: 0, offsetY: 0 }
    layouts[index] = selected
    if (!selectedWasPlaced) {
      placed.push({
        left:
          selected.side === 'right'
            ? position.left + selected.offsetX + 23
            : position.left + selected.offsetX - 23 - size.width,
        top: position.top - 27 + selected.offsetY - size.height / 2,
        ...size,
      })
    }
  }
  return layouts
}

export const GOOGLE_OFFLINE_HELP_URL =
  'https://support.google.com/maps/answer/6291838?hl=zh-Hans'

export function buildNavigationUrl(place: Pick<IPlace, 'lat' | 'lng'>): string {
  if (place.lat === null || place.lng === null) return ''
  const destination = `${place.lat},${place.lng}`
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`
}

export function formatCoordinate(place: Pick<IPlace, 'lat' | 'lng'>): string {
  if (place.lat === null || place.lng === null) return ''
  return `${place.lat}, ${place.lng}`
}

export function searchPlaces(places: IPlace[], query: string): IPlace[] {
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN')
  if (!normalizedQuery) return []
  return places.filter((place) =>
    [
      place.name,
      place.name_en,
      place.highlights,
      place.transport,
      place.notes,
      place.sections.nature,
      place.sections.culture,
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('zh-CN')
      .includes(normalizedQuery),
  )
}

export function selectRelevantDay(
  days: ITripDay[],
  now: Date,
  timezone = 'Australia/Hobart',
): ITripDay {
  const localDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
  return (
    days.find((day) => day.date === localDate) ??
    (localDate < days[0].date ? days[0] : days.at(-1)!)
  )
}

export function daysUntil(date: string, now = new Date()): number {
  const target = new Date(`${date}T00:00:00+08:00`).getTime()
  return Math.max(0, Math.ceil((target - now.getTime()) / 86_400_000))
}

export function getPlacesForDay(places: IPlace[], day: number): IPlace[] {
  return places
    .filter((place) => place.day === day && place.status === 'visit')
    .sort((left, right) => (left.order_in_day ?? 99) - (right.order_in_day ?? 99))
}

export function getMappableRhythmNodes(
  nodes: IRhythmNode[],
): Array<IRhythmNode & { lat: number; lng: number }> {
  return nodes.filter(
    (node): node is IRhythmNode & { lat: number; lng: number } =>
      node.lat !== null && node.lng !== null,
  )
}

export function getEmptyDaySummary(
  day: ITripDay,
  places: IPlace[],
): IEmptyDaySummary | null {
  if (getPlacesForDay(places, day.day).length) return null
  return {
    highlights: day.highlights,
    lodging: day.lodging,
    route: day.route,
    schedule: day.schedule,
  }
}

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

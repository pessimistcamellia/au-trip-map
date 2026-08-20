import type { IPlace, ITripDay } from '../types'

export interface IEmptyDaySummary {
  highlights: string
  lodging: string
  route: string
  schedule: string
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

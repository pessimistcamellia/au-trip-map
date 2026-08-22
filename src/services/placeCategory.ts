import type { IPlace, PlaceCategory } from '../types'

export type PlaceIconKey =
  | 'landscape'
  | 'hotel'
  | 'flight'
  | 'boat'
  | 'train'
  | 'restaurant'
  | 'storefront'

export interface IPlaceCategoryBadge {
  category: PlaceCategory
  label: string
  iconKey: PlaceIconKey
}

const BADGES: Record<PlaceCategory, IPlaceCategoryBadge> = {
  attraction: { category: 'attraction', label: '景点', iconKey: 'landscape' },
  lodging: { category: 'lodging', label: '住宿', iconKey: 'hotel' },
  transport: { category: 'transport', label: '交通枢纽', iconKey: 'flight' },
  restaurant: { category: 'restaurant', label: '餐厅', iconKey: 'restaurant' },
  market: { category: 'market', label: '市场', iconKey: 'storefront' },
}

interface ITransportKind {
  label: string
  iconKey: PlaceIconKey
  keywords: string[]
}

const TRANSPORT_KINDS: ITransportKind[] = [
  { label: '机场', iconKey: 'flight', keywords: ['机场', 'airport'] },
  {
    label: '码头',
    iconKey: 'boat',
    keywords: ['码头', '渡轮', 'ferry', 'wharf', 'terminal', 'harbour', 'pier'],
  },
  { label: '车站', iconKey: 'train', keywords: ['车站', 'station'] },
]

const LODGING_KEYWORDS = ['住宿', '营地', 'lodge', 'caravan park', 'campground', 'motel', 'hotel']
const MARKET_KEYWORDS = ['市场', 'market']
const RESTAURANT_KEYWORDS = ['餐厅', 'restaurant', 'cafe', 'bistro', 'diner']

function haystack(place: Pick<IPlace, 'name' | 'name_en'>): string {
  return `${place.name} ${place.name_en ?? ''}`.toLowerCase()
}

function matchTransportKind(text: string): ITransportKind | null {
  return (
    TRANSPORT_KINDS.find((kind) =>
      kind.keywords.some((keyword) => text.includes(keyword)),
    ) ?? null
  )
}

// 数据缺失时的兜底推断：住宿标记优先，避免「墨尔本（住宿）／Southern Cross Station」被判成车站。
export function inferPlaceCategory(
  place: Pick<IPlace, 'name' | 'name_en'>,
): PlaceCategory {
  const text = haystack(place)
  if (LODGING_KEYWORDS.some((keyword) => text.includes(keyword))) return 'lodging'
  if (matchTransportKind(text)) return 'transport'
  if (MARKET_KEYWORDS.some((keyword) => text.includes(keyword))) return 'market'
  if (RESTAURANT_KEYWORDS.some((keyword) => text.includes(keyword))) return 'restaurant'
  return 'attraction'
}

export function getPlaceCategoryBadge(
  place: Pick<IPlace, 'name' | 'name_en' | 'category'>,
): IPlaceCategoryBadge {
  const category = place.category ?? inferPlaceCategory(place)
  const badge = BADGES[category] ?? BADGES.attraction
  if (category !== 'transport') return badge
  const kind = matchTransportKind(haystack(place))
  if (!kind) return badge
  return { category, label: kind.label, iconKey: kind.iconKey }
}

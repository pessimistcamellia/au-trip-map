import type {
  ILink,
  IPlace,
  IPlaceDetailSection,
  IPlaceFood,
  IPlaceParking,
  PlaceDetailCategory,
  PlaceTextCategory,
} from '../types'
import { inferPlaceCategory } from './placeCategory'

function uniqueText(values: Array<string | undefined>): string[] {
  const normalized = values
    .flatMap((value) => value?.split(/\n{2,}/) ?? [])
    .map((value) => value.replace(/^扩展阅读：.*$/gm, '').trim())
    .filter(Boolean)
  return normalized.filter((value, index) => normalized.indexOf(value) === index)
}

export function getPlaceDetailSections(place: IPlace): IPlaceDetailSection[] {
  const sections: Record<PlaceTextCategory, string[]> = {
    看点: uniqueText([
      place.highlights,
      ...(place.dayInfo?.highlights ?? []),
      place.sections.nature,
    ]),
    实用: uniqueText([
      [place.duration, place.transport].filter(Boolean).join(' · '),
      ...(place.dayInfo?.booking ?? []),
      place.sections.practical,
      place.sections.suggestion,
    ]),
    天气: uniqueText([
      ...(place.dayInfo?.weather ?? []),
      place.weather,
    ]),
    文化: uniqueText([place.sections.culture]),
  }
  return (Object.keys(sections) as PlaceTextCategory[]).map((category) => ({
    category,
    items: sections[category],
  }))
}

export function getPlaceFood(place: IPlace): IPlaceFood | null {
  const food = place.food
  if (!food) return null
  if (!food.summary && !food.restaurants.length) return null
  return food
}

export function getPlaceParking(place: IPlace): IPlaceParking | null {
  const parking = place.parking
  if (!parking) return null
  if (!parking.summary && !parking.lots.length && !parking.rules.length) return null
  return parking
}

// 目的地本身就是餐厅时不再单开美食页签。
export function shouldShowFoodTab(place: IPlace): boolean {
  const category = place.category ?? inferPlaceCategory(place)
  return category !== 'restaurant' && getPlaceFood(place) !== null
}

export function getPlaceDetailCategories(place: IPlace): PlaceDetailCategory[] {
  const categories: PlaceDetailCategory[] = getPlaceDetailSections(place)
    .filter(
      (section) =>
        section.items.length > 0 ||
        (section.category === '实用' && getPlaceParking(place) !== null) ||
        getPlaceDetailLinksByCategory(place, section.category).length > 0,
    )
    .map((section) => section.category)
  if (shouldShowFoodTab(place)) categories.push('美食')
  return categories
}

export function getPlaceDetailLinks(place: IPlace): ILink[] {
  const links = [...place.links, ...(place.dayInfo?.links ?? [])]
  return links.filter(
    (link, index) =>
      links.findIndex((candidate) => candidate.url === link.url) === index,
  )
}

interface ILinkRule {
  category: PlaceDetailCategory
  hosts: string[]
  keywords: string[]
}

// 兜底为「看点」：外链多为景点自身的官方介绍页。
const LINK_FALLBACK_CATEGORY: PlaceDetailCategory = '看点'

const LINK_RULES: ILinkRule[] = [
  {
    category: '天气',
    hosts: ['bom.gov.au', 'hko.gov.hk', 'weather.com', 'weatherzone.com.au'],
    keywords: ['bom', '气候', '天气', '天文台', '气温', '降雨', '风力', 'weather', 'climate', 'forecast'],
  },
  {
    category: '实用',
    hosts: ['booking.com', 'ticketek.com.au', 'trybooking.com'],
    keywords: [
      '预订', '预约', '购票', '订票', '门票', '票价', '费用', '收费', '时刻表', '班次', '场次',
      '营业时间', '开放时间', '规则', '须知', '注意', '接驳', '渡轮', '航班', '停车', '租',
      '公告', '工程', '路况', '封闭', 'booking', 'ticket', 'fare', 'fee', 'hours', 'timetable',
      'opening', 'permit', 'parking',
    ],
  },
  {
    category: '文化',
    hosts: ['wikipedia.org'],
    keywords: [
      '人文', '历史', '文化', '原住民', '纪念', '战争', '殖民', '博物馆', '遗迹', '传说', '故事',
      'history', 'heritage', 'culture', 'museum', 'aboriginal', 'memorial',
    ],
  },
  {
    category: '看点',
    hosts: ['parks.', 'nationalparks', 'wildlife'],
    keywords: [
      '景点', '自然', '风景', '观景', '看点', '日出', '日落', '星空', '动物', '植物', '国家公园',
      '海滩', '灯塔', '瀑布', '巡游', 'nature', 'scenic', 'lookout', 'wildlife', 'park', 'beach',
    ],
  },
]

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return ''
  }
}

export function categorizeLink(link: ILink): PlaceDetailCategory {
  const label = link.label.toLowerCase()
  const host = hostOf(link.url)
  let best: { category: PlaceDetailCategory; score: number } | null = null
  for (const rule of LINK_RULES) {
    // 标签命中权重高于域名：景点官网域名常含 park / wildlife，不应盖过「购票」「规则」这类用途词。
    let score = rule.keywords.filter((keyword) => label.includes(keyword)).length * 3
    if (rule.hosts.some((candidate) => host.includes(candidate))) score += 1
    if (score > 0 && (best === null || score > best.score)) {
      best = { category: rule.category, score }
    }
  }
  return best?.category ?? LINK_FALLBACK_CATEGORY
}

export function getPlaceDetailLinksByCategory(
  place: IPlace,
  category: PlaceDetailCategory,
): ILink[] {
  return getPlaceDetailLinks(place).filter((link) => categorizeLink(link) === category)
}

export function hasPlaceDetails(place: IPlace): boolean {
  return (
    getPlaceDetailSections(place).some((section) => section.items.length > 0) ||
    getPlaceDetailLinks(place).length > 0 ||
    getPlaceFood(place) !== null ||
    getPlaceParking(place) !== null
  )
}

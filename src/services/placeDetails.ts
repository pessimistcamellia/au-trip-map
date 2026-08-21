import type {
  ILink,
  IPlace,
  IPlaceDetailSection,
  PlaceDetailCategory,
} from '../types'

function uniqueText(values: Array<string | undefined>): string[] {
  const normalized = values
    .flatMap((value) => value?.split(/\n{2,}/) ?? [])
    .map((value) => value.replace(/^扩展阅读：.*$/gm, '').trim())
    .filter(Boolean)
  return normalized.filter((value, index) => normalized.indexOf(value) === index)
}

export function getPlaceDetailSections(place: IPlace): IPlaceDetailSection[] {
  const sections: Record<PlaceDetailCategory, string[]> = {
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
  return (Object.keys(sections) as PlaceDetailCategory[]).map((category) => ({
    category,
    items: sections[category],
  }))
}

export function getPlaceDetailLinks(place: IPlace): ILink[] {
  const links = [...place.links, ...(place.dayInfo?.links ?? [])]
  return links.filter(
    (link, index) =>
      links.findIndex((candidate) => candidate.url === link.url) === index,
  )
}

export function hasPlaceDetails(place: IPlace): boolean {
  return (
    getPlaceDetailSections(place).some((section) => section.items.length > 0) ||
    getPlaceDetailLinks(place).length > 0
  )
}

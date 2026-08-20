import { describe, expect, it } from 'vitest'
import rawTripData from '../src/data/trip-data.json'
import type { ITripData } from '../src/types'
import {
  buildNavigationUrl,
  getEmptyDaySummary,
  getMappableRhythmNodes,
  getPlacesForDay,
  searchPlaces,
  selectRelevantDay,
} from '../src/utils/trip'

const data = rawTripData as ITripData

describe('静态行程数据', () => {
  it('完整覆盖 13 天、83 条地点和 skip 状态', () => {
    expect(data.days).toHaveLength(13)
    expect(data.places).toHaveLength(83)
    expect(data.places.filter((place) => place.status === 'visit')).toHaveLength(
      50,
    )
    expect(data.places.filter((place) => place.status === 'skip')).toHaveLength(
      33,
    )
    expect(
      data.places.filter(
        (place) => place.lat !== null && place.lng !== null,
      ),
    ).toHaveLength(79)
    expect(data.wishlistCount).toBe(53)
  })

  it('按日排序并保留 10 月 5 日可选 Loch Ard', () => {
    const places = getPlacesForDay(data.places, 12)
    expect(places[0].id).toBe('d12-01')
    expect(places.some((place) => place.id === 'wv-loch')).toBe(true)
    expect(places.find((place) => place.id === 'wv-loch')?.priority).toBe(
      'optional',
    )
  })

  it('无点位日返回富内容空状态，有点位日不返回', () => {
    const firstDay = data.days.find((day) => day.day === 1)!
    const secondDay = data.days.find((day) => day.day === 2)!

    expect(getPlacesForDay(data.places, firstDay.day)).toEqual([])
    expect(getEmptyDaySummary(firstDay, data.places)).toMatchObject({
      highlights: expect.stringContaining('纯转场日'),
      route: expect.stringContaining('TR139'),
      lodging: expect.stringContaining('飞机'),
      schedule: expect.stringContaining('新加坡樟宜机场'),
    })
    expect(getEmptyDaySummary(secondDay, data.places)).toBeNull()
  })

  it('按当天节奏顺序解析时间与地图点', () => {
    const day = data.days.find((item) => item.day === 2)!
    const points = getMappableRhythmNodes(day.rhythm)

    expect(day.rhythm[0]).toMatchObject({
      order: 1,
      time: '04:20-07:45',
      placeId: 'd2-01',
    })
    expect(points.map((point) => point.placeId)).toEqual([
      'd2-01',
      'd2-02',
      'd2-03',
      'd2-04',
      'd2-05',
    ])
    expect(points.at(-1)?.time).toBe('日落后')
  })

  it('无坐标节奏节点保留在文字列表且地图过滤不报错', () => {
    const transitionDay = data.days.find((item) => item.day === 1)!

    expect(transitionDay.rhythm.length).toBeGreaterThan(0)
    expect(getMappableRhythmNodes(transitionDay.rhythm)).toEqual([])
    expect(transitionDay.rhythm.every((node) => node.lat === null)).toBe(true)
  })
})

describe('地图导航', () => {
  it('生成 universal HTTPS Google Maps 驾车 URL', () => {
    const place = data.places.find((item) => item.id === 'd8-01')!
    expect(buildNavigationUrl(place)).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=-42.145%2C148.29&travelmode=driving',
    )
  })

  it('无坐标地点不生成导航链接', () => {
    expect(buildNavigationUrl({ lat: null, lng: null })).toBe('')
  })
})

describe('搜索和日程选择', () => {
  it('同时搜索中文、英文和文化内容', () => {
    expect(searchPlaces(data.places, '袋熊').length).toBeGreaterThan(2)
    expect(
      searchPlaces(data.places, 'Wineglass').some(
        (place) => place.id === 'd8-01',
      ),
    ).toBe(true)
    expect(searchPlaces(data.places, 'Traditional Owners').length).toBeGreaterThan(
      0,
    )
  })

  it('澳洲当地日期命中当天，出发前回落首日', () => {
    expect(
      selectRelevantDay(
        data.days,
        new Date('2026-10-01T00:30:00+10:00'),
      ).day,
    ).toBe(8)
    expect(
      selectRelevantDay(data.days, new Date('2026-08-19T00:00:00+10:00')).day,
    ).toBe(1)
  })
})

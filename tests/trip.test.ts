import { describe, expect, it } from 'vitest'
import rawTripData from '../src/data/trip-data.json'
import type { ITripData } from '../src/types'
import {
  buildNavigationUrl,
  calculateMapViewport,
  getEmptyDaySummary,
  getMappableRhythmNodes,
  getPlacesForDay,
  searchPlaces,
  selectRelevantDay,
  spreadMapMarkerPositions,
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

  it('按地点别名把日级信息归属到点，匹配不到的保留在其他信息', () => {
    const day = data.days.find((item) => item.day === 2)!
    const caversham = data.places.find((place) => place.id === 'd2-02')!

    expect(caversham.dayInfo?.booking.join('')).toContain('抱考拉')
    expect(caversham.dayInfo?.weather.join('')).toContain('卡弗舍姆')
    expect(day.unassigned.booking.join('')).not.toContain('抱考拉')
    expect(
      data.days.reduce(
        (count, item) =>
          count +
          item.unassigned.booking.length +
          item.unassigned.highlights.length +
          item.unassigned.weather.length,
        0,
      ),
    ).toBeGreaterThan(0)
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

  it('按容器边界计算多点全览，单点使用有限默认层级', () => {
    const day = data.days.find((item) => item.day === 2)!
    const points = getMappableRhythmNodes(day.rhythm)
    const viewport = calculateMapViewport(points, 328, 430)!
    const single = calculateMapViewport([points[0]], 328, 430)!

    expect(viewport.zoom).toBeGreaterThanOrEqual(3)
    expect(viewport.zoom).toBeLessThan(13)
    expect(viewport.center.lat).toBeLessThan(Math.max(...points.map((p) => p.lat)))
    expect(viewport.center.lat).toBeGreaterThan(Math.min(...points.map((p) => p.lat)))
    expect(single).toMatchObject({ center: points[0], zoom: 13 })
  })

  it('密集编号自动错位且仍留在地图容器内', () => {
    const positions = spreadMapMarkerPositions(
      Array.from({ length: 8 }, (_, index) => ({
        left: 150 + index,
        top: 180 + index,
      })),
      328,
      430,
    )

    expect(positions.some((position) => position.displaced)).toBe(true)
    const distances = positions.flatMap((position, index) =>
      positions
        .slice(index + 1)
        .map((other) =>
          Math.hypot(position.left - other.left, position.top - other.top),
        ),
    )
    expect(Math.min(...distances)).toBeGreaterThanOrEqual(42)
    expect(positions.every((position) => position.left >= 24 && position.left <= 304)).toBe(true)
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

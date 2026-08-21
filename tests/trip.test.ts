import { describe, expect, it } from 'vitest'
import rawTripData from '../src/data/trip-data.json'
import {
  groupJournalsByDate,
  InMemoryJournalRepository,
  MAX_JOURNAL_PHOTOS,
} from '../src/repositories/journalRepository'
import { StaticTripRepository } from '../src/repositories/tripRepository'
import {
  StaticClimateWeatherProvider,
  StaticWeatherRepository,
} from '../src/repositories/weatherRepository'
import {
  categorizeLink,
  getPlaceDetailLinks,
  getPlaceDetailLinksByCategory,
  getPlaceDetailSections,
  hasPlaceDetails,
} from '../src/services/placeDetails'
import {
  escapeHtml,
  generateStaticTripHtml,
} from '../src/services/staticTripExport'
import type { ITripData } from '../src/types'
import {
  buildNavigationUrl,
  calculateMapViewport,
  getEmptyDaySummary,
  getMappableRhythmNodes,
  getPlacesForDay,
  searchPlaces,
  selectRelevantDay,
  shouldStartMapDrag,
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

  it('数据层提供稳定序号，地图沿用序号且 optional 保持一致', () => {
    const places = getPlacesForDay(data.places, 2)
    const mapPoints = getMappableRhythmNodes(data.days[1].rhythm)

    expect(places.map((place) => place.sequence)).toEqual([1, 2, 3, 4, 5])
    expect(mapPoints.map((point) => point.sequence)).toEqual([1, 2, 3, 4, 5])
    expect(mapPoints.find((point) => point.placeId === 'd2-03')).toMatchObject({
      sequence: 3,
      priority: 'optional',
    })
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

describe('目的地信息分类与 repository', () => {
  it('固定输出四分类，外链统一去重且空数据不显示更多', () => {
    const place = data.places.find((item) => item.id === 'd2-02')!
    expect(getPlaceDetailSections(place).map((section) => section.category)).toEqual([
      '看点',
      '实用',
      '天气',
      '文化',
    ])
    expect(getPlaceDetailSections(place).find((section) => section.category === '实用')?.items.join('')).toContain('抱考拉')
    const links = getPlaceDetailLinks(place)
    expect(new Set(links.map((link) => link.url)).size).toBe(links.length)
    expect(
      hasPlaceDetails({
        ...place,
        highlights: '',
        weather: '',
        duration: '',
        transport: '',
        sections: {},
        links: [],
        dayInfo: { booking: [], highlights: [], weather: [], links: [] },
      }),
    ).toBe(false)
  })

  it('延伸阅读按当前分类过滤，且四类之和等于全部外链', () => {
    expect(categorizeLink({ label: 'BOM气候参考', url: 'http://www.bom.gov.au/x' })).toBe('天气')
    expect(categorizeLink({ label: '官方购票', url: 'https://example.com/tickets' })).toBe('实用')
    expect(categorizeLink({ label: '抱考拉规则', url: 'https://example.com/koala' })).toBe('实用')
    expect(categorizeLink({ label: '人文／历史延伸阅读', url: 'https://example.com/h' })).toBe('文化')
    expect(categorizeLink({ label: '景点／自然官方资料', url: 'https://example.com/n' })).toBe('看点')
    expect(categorizeLink({ label: '工程页面', url: 'https://example.com/works' })).toBe('实用')
    // 无关键词也无已知域名时落到兜底分类，不会丢链接
    expect(categorizeLink({ label: 'Maits Rest官方页面', url: 'https://example.com/m' })).toBe('看点')

    const place = data.places.find((item) => item.id === 'd2-02')!
    const all = getPlaceDetailLinks(place)
    const buckets = (['看点', '实用', '天气', '文化'] as const).map((category) =>
      getPlaceDetailLinksByCategory(place, category),
    )
    expect(buckets.reduce((count, bucket) => count + bucket.length, 0)).toBe(all.length)
    expect(getPlaceDetailLinksByCategory(place, '天气').every((link) => /BOM|气候|天文台/i.test(link.label))).toBe(true)
    expect(getPlaceDetailLinksByCategory(place, '文化').some((link) => link.label.includes('人文'))).toBe(true)
    // 景点官网域名含 wildlife，不得把「购票」「规则」抢到看点
    const practical = getPlaceDetailLinksByCategory(place, '实用').map((link) => link.label)
    expect(practical).toContain('官方购票')
    expect(practical).toContain('抱考拉规则')
    expect(getPlaceDetailLinksByCategory(place, '看点').map((link) => link.label)).not.toContain('官方购票')
  })

  it('TripRepository 隔离静态 JSON，天气在远期日期回退气候参考', async () => {
    const tripRepository = new StaticTripRepository(data)
    const place = (await tripRepository.getPlace('d2-02'))!
    const weatherRepository = new StaticWeatherRepository(
      new StaticClimateWeatherProvider(),
    )
    const weather = await weatherRepository.getWeather(place)

    expect((await tripRepository.getTrip()).days).toHaveLength(13)
    expect(weather).toMatchObject({
      kind: 'climate-reference',
      forecastStatus: 'outside-forecast-window',
    })
    expect(weather.temperatureRange).toMatch(/°C/)
    expect(weather.precipitation).toBeNull()
    expect(weather.uvIndex).toBeNull()
  })
})

describe('随手记', () => {
  it('支持 CRUD、按地点过滤和按日期倒序汇总', async () => {
    const repository = new InMemoryJournalRepository()
    const first = await repository.create({
      placeId: 'd2-02',
      day: 2,
      date: '2026-09-25',
      text: '第一篇',
      photos: [],
    })
    await repository.create({
      placeId: 'd3-01',
      day: 3,
      date: '2026-09-26',
      text: '第二篇',
      photos: [],
    })

    expect(await repository.list('d2-02')).toHaveLength(1)
    expect(groupJournalsByDate(await repository.list()).map(([date]) => date)).toEqual([
      '2026-09-26',
      '2026-09-25',
    ])
    expect((await repository.update(first.id, '已编辑'))?.text).toBe('已编辑')
    await repository.delete(first.id)
    expect(await repository.list('d2-02')).toEqual([])
  })

  it('每篇最多允许 10 张照片', async () => {
    const repository = new InMemoryJournalRepository()
    const photo = { blob: new Blob(['x']), name: 'x.jpg', type: 'image/jpeg' }
    await expect(
      repository.create({
        placeId: 'd2-02',
        day: 2,
        date: '2026-09-25',
        text: '超限',
        photos: Array.from({ length: MAX_JOURNAL_PHOTOS + 1 }, () => photo),
      }),
    ).rejects.toThrow('最多 10 张')
  })
})

describe('静态路书导出', () => {
  it('转义用户文本并生成包含全部 13 天的单文件 HTML', async () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;',
    )
    const html = await generateStaticTripHtml(data)
    expect(html).toContain('<!doctype html>')
    expect(html).toContain('第 13 天')
    expect(html).toContain('默认未包含本机随手记')
    expect(html).not.toContain('<script>')
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

  it('地图控件不会触发容器 pointer capture，普通底图仍可拖动', () => {
    expect(shouldStartMapDrag(false, true)).toBe(false)
    expect(shouldStartMapDrag(false, false)).toBe(true)
    expect(shouldStartMapDrag(true, false)).toBe(false)
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

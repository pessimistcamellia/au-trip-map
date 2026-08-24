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
  getPlaceCategoryBadge,
  inferPlaceCategory,
} from '../src/services/placeCategory'
import {
  categorizeLink,
  getPlaceDetailCategories,
  getPlaceDetailLinks,
  getPlaceDetailLinksByCategory,
  getPlaceDetailSections,
  getPlaceFood,
  getPlaceParking,
  hasPlaceDetails,
  shouldShowFoodTab,
} from '../src/services/placeDetails'
import {
  escapeHtml,
  generateStaticTripHtml,
} from '../src/services/staticTripExport'
import type { ITripData } from '../src/types'
import { getBottomNavVisibility } from '../src/utils/bottomNav'
import {
  buildNavigationUrl,
  calculateMapLabelLayouts,
  calculateMapViewport,
  calculatePinchZoom,
  getEmptyDaySummary,
  getMapLabelSide,
  getMappableRhythmNodes,
  getPlacesForDay,
  searchPlaces,
  selectRelevantDay,
  shouldStartMapDrag,
  spreadMapMarkerPositions,
} from '../src/utils/trip'

const data = rawTripData as ITripData

interface ITestRect {
  left: number
  top: number
  width: number
  height: number
}

function rectanglesOverlap(left: ITestRect, right: ITestRect): boolean {
  return !(
    left.left + left.width <= right.left ||
    right.left + right.width <= left.left ||
    left.top + left.height <= right.top ||
    right.top + right.height <= left.top
  )
}

describe('静态行程数据', () => {
  it('完整覆盖 13 天、85 条地点和 skip 状态', () => {
    expect(data.days).toHaveLength(13)
    expect(data.places).toHaveLength(85)
    expect(data.places.filter((place) => place.status === 'visit')).toHaveLength(
      50,
    )
    expect(data.places.filter((place) => place.status === 'skip')).toHaveLength(
      35,
    )
    expect(
      data.places.filter(
        (place) => place.lat !== null && place.lng !== null,
      ),
    ).toHaveLength(79)
    expect(data.wishlistCount).toBe(54)
  })

  it('按日排序并保留 10 月 5 日可选 Loch Ard', () => {
    const places = getPlacesForDay(data.places, 12)
    expect(places[0].id).toBe('d12-01')
    expect(places.some((place) => place.id === 'wv-loch')).toBe(true)
    expect(places.find((place) => place.id === 'wv-loch')?.priority).toBe(
      'optional',
    )
    expect(places.map((place) => place.id)).toEqual([
      'd12-01',
      'd12-02',
      'd12-03',
      'wv-loch',
      'd12-04',
      'd12-08',
      'd12-07',
    ])
    expect(places.find((place) => place.id === 'd12-08')).toMatchObject({
      name: '圣基尔达企鹅观赏平台',
      sequence: 6,
    })
    expect(data.places.find((place) => place.id === 'd12-05')?.status).toBe(
      'skip',
    )
    expect(data.places.find((place) => place.id === 'd12-06')?.status).toBe(
      'skip',
    )
  })

  it('10 月 1 日取消比舍诺并在下午直达朗塞斯顿', () => {
    const places = getPlacesForDay(data.places, 8)
    expect(places.map((place) => place.id)).toEqual([
      'd8-01',
      'd8-02',
      'd8-03',
      'd8-05',
    ])
    expect(data.places.find((place) => place.id === 'd8-04')?.status).toBe(
      'skip',
    )
    expect(data.days.find((day) => day.day === 8)?.schedule).toContain(
      '约176公里',
    )
  })

  it('10 月 4 日以可选 Puffing Billy 开头，其余顺序后移', () => {
    const places = getPlacesForDay(data.places, 11)
    expect(places[0].id).toBe('wv-puffing')
    expect(places[0].priority).toBe('optional')
    expect(places[1].id).toBe('d11-01')
    expect(places[places.length - 1].id).toBe('d11-06')
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

  it('地图地名标签始终朝容器内部展开', () => {
    expect(getMapLabelSide({ left: 30 }, 390)).toBe('right')
    expect(getMapLabelSide({ left: 160 }, 390)).toBe('right')
    expect(getMapLabelSide({ left: 230 }, 390)).toBe('left')
    expect(getMapLabelSide({ left: 360 }, 390)).toBe('left')
    expect(getMapLabelSide({ left: 0 }, 0)).toBe('right')
  })

  it('密集地图地名标签保持完整且避开其他标签与全部编号', () => {
    const width = 328
    const height = 430
    const positions = [
      { left: 150, top: 150 },
      { left: 106, top: 142 },
    ]
    const layouts = calculateMapLabelLayouts(
      [
        { title: '兰斯林沙丘' },
        { title: '尖峰石阵／南邦国家公园' },
      ],
      positions,
      width,
      height,
    )
    const markerRects = positions.map((position) => ({
      left: position.left - 22,
      top: position.top - 44,
      width: 44,
      height: 44,
    }))

    expect(layouts).toHaveLength(2)
    expect(
      layouts.every(
        (layout) =>
          layout.left >= 4 &&
          layout.left + layout.width <= width - 4 &&
          layout.top >= 4 &&
          layout.top + layout.height <= height - 4,
      ),
    ).toBe(true)
    expect(rectanglesOverlap(layouts[0], layouts[1])).toBe(false)
    expect(
      layouts.every((layout) =>
        markerRects.every((marker) => !rectanglesOverlap(layout, marker)),
      ),
    ).toBe(true)
  })

  it('坐标塌陷时仍为每个点返回容器内标签矩形', () => {
    const width = 328
    const height = 430
    const points = Array.from({ length: 8 }, (_, index) => ({
      title: `重合地点${index + 1}`,
    }))
    const positions = points.map(() => ({ left: 164, top: 215 }))

    expect(() =>
      calculateMapLabelLayouts(points, positions, width, height),
    ).not.toThrow()
    const layouts = calculateMapLabelLayouts(points, positions, width, height)

    expect(layouts).toHaveLength(points.length)
    expect(
      layouts.every(
        (layout) =>
          layout.left >= 4 &&
          layout.left + layout.width <= width - 4 &&
          layout.top >= 4 &&
          layout.top + layout.height <= height - 4,
      ),
    ).toBe(true)
  })

  it('八点密集地图仍能为标签找到无碰撞空位', () => {
    const width = 328
    const height = 430
    const positions = [
      { left: 145.876, top: 241.156 },
      { left: 81.169, top: 192.199 },
      { left: 81.387, top: 279.936 },
      { left: 167.804, top: 146.858 },
      { left: 208.39, top: 277.227 },
      { left: 117.432, top: 233.285 },
      { left: 116.522, top: 232.994 },
      { left: 253.478, top: 186.844 },
    ]
    const layouts = calculateMapLabelLayouts(
      [
        { title: '梅茨雨林步道' },
        { title: '吉布森阶梯' },
        { title: '十二门徒岩' },
        { title: '洛克阿德峡谷' },
        { title: '坎贝尔港' },
        { title: '伦敦桥' },
        { title: '石窟' },
        { title: '墨尔本（住宿）' },
      ],
      positions,
      width,
      height,
    )
    const markerRects = positions.map((position) => ({
      left: position.left - 22,
      top: position.top - 44,
      width: 44,
      height: 44,
    }))

    for (const [index, layout] of layouts.entries()) {
      expect(layout.left).toBeGreaterThanOrEqual(4)
      expect(layout.left + layout.width).toBeLessThanOrEqual(width - 4)
      expect(layout.top).toBeGreaterThanOrEqual(4)
      expect(layout.top + layout.height).toBeLessThanOrEqual(height - 4)
      expect(
        layouts
          .slice(index + 1)
          .every((other) => !rectanglesOverlap(layout, other)),
      ).toBe(true)
      expect(
        markerRects.every((marker) => !rectanglesOverlap(layout, marker)),
      ).toBe(true)
    }
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
        food: undefined,
        parking: undefined,
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

describe('目的地类别与图标', () => {
  it('按机场、码头、住宿、市场分别给出类别与官方图标键', () => {
    const badges = ['d2-01', 'd10-02', 'd12-07', 'd13-01', 'd8-01'].map((id) => {
      const place = data.places.find((item) => item.id === id)!
      return { id, ...getPlaceCategoryBadge(place) }
    })
    expect(badges).toEqual([
      { id: 'd2-01', category: 'transport', label: '机场', iconKey: 'flight' },
      { id: 'd10-02', category: 'transport', label: '码头', iconKey: 'boat' },
      { id: 'd12-07', category: 'lodging', label: '住宿', iconKey: 'hotel' },
      { id: 'd13-01', category: 'market', label: '市场', iconKey: 'storefront' },
      { id: 'd8-01', category: 'attraction', label: '景点', iconKey: 'landscape' },
    ])
  })

  it('缺少类别数据时按名称兜底，住宿标记不被车站抢走', () => {
    expect(
      inferPlaceCategory({ name: '墨尔本（住宿）', name_en: 'Southern Cross Station' }),
    ).toBe('lodging')
    expect(inferPlaceCategory({ name: '霍巴特机场', name_en: 'Hobart Airport' })).toBe(
      'transport',
    )
    expect(inferPlaceCategory({ name: '酒杯湾观景台', name_en: 'Wineglass Bay' })).toBe(
      'attraction',
    )
  })

  it('每个当日行程点都有类别、附近美食与停车资料', () => {
    const rhythmPlaceIds = new Set(
      data.days.flatMap((day) =>
        day.rhythm.map((node) => node.placeId).filter((id): id is string => Boolean(id)),
      ),
    )
    const places = data.places.filter((place) => rhythmPlaceIds.has(place.id))
    expect(places.length).toBeGreaterThanOrEqual(44)
    expect(places.filter((place) => !place.category)).toEqual([])
    expect(places.filter((place) => getPlaceFood(place) === null)).toEqual([])
    expect(places.filter((place) => getPlaceParking(place) === null)).toEqual([])
  })

  it('餐厅条目带可核对来源，评分要么是真实数字要么为空', () => {
    const restaurants = data.places.flatMap((place) => place.food?.restaurants ?? [])
    expect(restaurants.length).toBeGreaterThan(80)
    for (const restaurant of restaurants) {
      expect(restaurant.name).not.toBe('')
      expect(restaurant.sourceUrl).toMatch(/^https?:\/\//)
      if (restaurant.rating !== null) {
        expect(restaurant.rating).toBeGreaterThan(0)
        expect(restaurant.rating).toBeLessThanOrEqual(5)
      }
    }
  })

  it('停车收费口径只用受支持的取值', () => {
    const lots = data.places.flatMap((place) => place.parking?.lots ?? [])
    expect(lots.length).toBeGreaterThan(0)
    for (const lot of lots) {
      expect(['free', 'paid', 'mixed', 'unknown']).toContain(lot.fee)
    }
  })
})

describe('美食页签与逐点天气', () => {
  it('非餐厅目的地才出现美食页签，且空分类不占位', () => {
    const airport = data.places.find((item) => item.id === 'd2-01')!
    expect(shouldShowFoodTab(airport)).toBe(true)
    expect(getPlaceDetailCategories(airport)).toContain('美食')
    expect(getPlaceDetailCategories(airport)).not.toContain('文化')
    expect(shouldShowFoodTab({ ...airport, category: 'restaurant' })).toBe(false)
    expect(getPlaceDetailCategories({ ...airport, category: 'restaurant' })).not.toContain(
      '美食',
    )
  })

  it('天气只讲当前这一个点，不再罗列同日其它目的地', async () => {
    const weatherRepository = new StaticWeatherRepository(
      new StaticClimateWeatherProvider(),
    )
    const airport = data.places.find((item) => item.id === 'd2-01')!
    const weather = await weatherRepository.getWeather(airport)

    expect(weather.temperatureRange).toBe('10-21°C')
    expect(weather.granularity).toBe('place')
    expect(`${weather.note}${weather.temperatureRange}`).not.toContain('兰斯林')
    expect(`${weather.note}${weather.temperatureRange}`).not.toContain('尖峰石阵')
  })

  it('同一天不同点各自取到所属区域的温度', async () => {
    const weatherRepository = new StaticWeatherRepository(
      new StaticClimateWeatherProvider(),
    )
    const platypus = data.places.find((item) => item.id === 'd9-01')!
    const ronnyCreek = data.places.find((item) => item.id === 'd9-03')!

    const beautyPoint = await weatherRepository.getWeather(platypus)
    const cradle = await weatherRepository.getWeather(ronnyCreek)

    expect(beautyPoint.temperatureRange).toBe('6-17°C')
    expect(cradle.temperatureRange).toBe('0-10°C')
    expect(cradle.granularity).toBe('nearby')
    expect(cradle.basis).toContain('鸽子湖')
  })

  it('每个当日行程点都有逐点气候，并保留当日共同提示', () => {
    const rhythmPlaceIds = new Set(
      data.days.flatMap((day) =>
        day.rhythm.map((node) => node.placeId).filter((id): id is string => Boolean(id)),
      ),
    )
    const places = data.places.filter((place) => rhythmPlaceIds.has(place.id))
    expect(places.filter((place) => !place.weatherDetail)).toEqual([])
    expect(
      places.filter((place) => !place.weatherDetail?.temperatureRange),
    ).toEqual([])
    expect(
      places.filter((place) => !place.weatherDetail?.dayAdvisory).map((place) => place.id),
    ).toEqual([])
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

  it('双指距离按倍数换算缩放层级并限制地图范围', () => {
    expect(calculatePinchZoom(8, 100, 200)).toBe(9)
    expect(calculatePinchZoom(8, 100, 50)).toBe(7)
    expect(calculatePinchZoom(16, 100, 400)).toBe(16)
    expect(calculatePinchZoom(3, 100, 10)).toBe(3)
    expect(calculatePinchZoom(8, 0, 200)).toBe(8)
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

describe('移动端底栏滚动显隐', () => {
  const base = {
    viewportHeight: 844,
    documentHeight: 3000,
    currentVisible: true,
  }

  it('顶部和接近页底时始终显示', () => {
    expect(
      getBottomNavVisibility({
        ...base,
        currentY: 8,
        direction: 'down',
        directionDistance: 100,
      }),
    ).toBe(true)
    expect(
      getBottomNavVisibility({
        ...base,
        currentY: 2120,
        direction: 'down',
        directionDistance: 100,
      }),
    ).toBe(true)
  })

  it('持续下滑后隐藏，轻微上滑后恢复', () => {
    expect(
      getBottomNavVisibility({
        ...base,
        currentY: 500,
        direction: 'down',
        directionDistance: 80,
      }),
    ).toBe(false)
    expect(
      getBottomNavVisibility({
        ...base,
        currentY: 480,
        direction: 'up',
        directionDistance: 20,
        currentVisible: false,
      }),
    ).toBe(true)
  })

  it('未达到方向阈值时维持当前状态，避免抖动', () => {
    expect(
      getBottomNavVisibility({
        ...base,
        currentY: 500,
        direction: 'down',
        directionDistance: 24,
      }),
    ).toBe(true)
    expect(
      getBottomNavVisibility({
        ...base,
        currentY: 480,
        direction: 'up',
        directionDistance: 8,
        currentVisible: false,
      }),
    ).toBe(false)
  })
})

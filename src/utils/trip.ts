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

export function calculatePinchZoom(
  startZoom: number,
  startDistance: number,
  currentDistance: number,
): number {
  if (startDistance <= 0 || currentDistance <= 0) return startZoom
  const nextZoom = Math.round(startZoom + Math.log2(currentDistance / startDistance))
  return Math.max(3, Math.min(16, nextZoom))
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
  left: number
  top: number
  width: number
  height: number
  align: 'left' | 'right'
  anchored: boolean
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

const MAP_LABEL_FONT_SIZE = 14
const MAP_LABEL_LINE_HEIGHT = 17.5
const MAP_LABEL_MAX_WIDTH = 122
// 盒模型为 border-box：左右各 8px 内边距加 1px 描边，共 18px；上下同理共 12px。
const MAP_LABEL_INSET = 18
const MAP_LABEL_BLOCK_INSET = 12
const MAP_LABEL_MAX_LINES = 3
const MAP_LABEL_MIN_LINES = 2
const MAP_LABEL_CAPACITY =
  (MAP_LABEL_MAX_WIDTH - MAP_LABEL_INSET) / MAP_LABEL_FONT_SIZE

// 字宽单位以 1em 为基准，实测标签字体（14px / weight 750）后各留约 5% 余量，
// 避免估算偏窄导致浏览器多折一行、把文字裁掉半截。
const CJK_UNIT = 1.04
const LATIN_UNIT = 0.62
const SPACE_UNIT = 0.3
const CJK_PATTERN = /[\u2E80-\u9FFF]/u

function measureTextUnits(text: string): number {
  return [...text].reduce((total, character) => {
    if (CJK_PATTERN.test(character)) return total + CJK_UNIT
    if (/\s/u.test(character)) return total + SPACE_UNIT
    return total + LATIN_UNIT
  }, 0)
}

interface ILabelToken {
  text: string
  units: number
  spaced: boolean
  end: number
}

/** 中日韩逐字可断行，拉丁按空白成词，与浏览器换行规则保持一致。 */
function tokenizeLabel(text: string): ILabelToken[] {
  const tokens: ILabelToken[] = []
  let buffer = ''
  let spaced = false
  let index = 0
  const flush = (end: number): void => {
    if (!buffer) return
    tokens.push({ text: buffer, units: measureTextUnits(buffer), spaced, end })
    buffer = ''
    spaced = false
  }

  for (const character of text) {
    if (/\s/u.test(character)) {
      flush(index)
      spaced = true
    } else if (CJK_PATTERN.test(character)) {
      flush(index)
      tokens.push({
        text: character,
        units: CJK_UNIT,
        spaced,
        end: index + character.length,
      })
      spaced = false
    } else {
      buffer += character
    }
    index += character.length
  }
  flush(index)
  return tokens
}

interface ILabelLine {
  text: string
  units: number
  end: number
}

function wrapLabelLines(text: string, capacity: number): ILabelLine[] {
  const lines: ILabelLine[] = []
  let current: ILabelLine | null = null

  for (const token of tokenizeLabel(text)) {
    const separator: number = current && token.spaced ? SPACE_UNIT : 0
    if (current && current.units + separator + token.units > capacity) {
      lines.push(current)
      current = { text: token.text, units: token.units, end: token.end }
      continue
    }
    current = current
      ? {
          text: `${current.text}${token.spaced ? ' ' : ''}${token.text}`,
          units: current.units + separator + token.units,
          end: token.end,
        }
      : { text: token.text, units: token.units, end: token.end }
  }
  if (current) lines.push(current)
  return lines
}

/**
 * 地图标签最多三行，超长地名靠 CSS 裁切会露出半行文字，
 * 因此先去掉括号补充说明，再按真实换行位置截断并补省略号。
 */
export function formatMapLabel(title: string): string {
  const stripped =
    title
      .replace(/（[^）]*）/g, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/\s+/g, ' ')
      .trim() || title.trim()
  const lines = wrapLabelLines(stripped, MAP_LABEL_CAPACITY)
  if (lines.length <= MAP_LABEL_MAX_LINES) return stripped

  const lastLineStart = lines[MAP_LABEL_MAX_LINES - 2].end
  const ellipsisUnits = measureTextUnits('…')
  let kept = stripped.slice(0, lines[MAP_LABEL_MAX_LINES - 1].end).trimEnd()
  while (
    kept.length > lastLineStart &&
    measureTextUnits(kept.slice(lastLineStart).trimStart()) + ellipsisUnits >
      MAP_LABEL_CAPACITY
  ) {
    kept = kept.slice(0, -1).trimEnd()
  }
  return `${kept}…`
}

function estimateMapLabelSize(title: string): { width: number; height: number } {
  const lines = wrapLabelLines(formatMapLabel(title), MAP_LABEL_CAPACITY)
  const longest = lines.reduce((widest, line) => Math.max(widest, line.units), 0)
  const width = Math.min(
    MAP_LABEL_MAX_WIDTH,
    Math.max(54, Math.ceil(longest * MAP_LABEL_FONT_SIZE) + MAP_LABEL_INSET),
  )
  // 单行文本按两行预留，留出字体差异导致意外折行的余量。
  const lineCount = Math.min(
    MAP_LABEL_MAX_LINES,
    Math.max(MAP_LABEL_MIN_LINES, lines.length),
  )
  return {
    width,
    height: Math.ceil(lineCount * MAP_LABEL_LINE_HEIGHT) + MAP_LABEL_BLOCK_INSET,
  }
}

const MARKER_GAP = 23
const MARKER_ANCHOR_OFFSET = 27

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
    const position = positions[index]
    const size = estimateMapLabelSize(points[index].title)
    const anchorY = position.top - MARKER_ANCHOR_OFFSET
    const preferred = getMapLabelSide(position, width)
    const sides = preferred === 'right' ? ['right', 'left'] : ['left', 'right']
    // 横向永远由 JS 定位：靠边时用 transform 会先被容器压缩宽度，把地名挤成竖条。
    const columns = sides
      .map((side) => ({
        side: side as 'left' | 'right',
        left:
          side === 'right'
            ? position.left + MARKER_GAP
            : position.left - MARKER_GAP - size.width,
      }))
      .concat([
        { side: 'right', left: 4 },
        { side: 'left', left: width - 4 - size.width },
      ])
    const verticalOffsets = [
      0, -26, 26, -52, 52, -78, 78, -104, 104, -130, 130, -156, 156,
    ]

    let chosen: ILayoutRect | undefined
    let anchored = false
    let align: 'left' | 'right' = preferred
    const isAvailable = (rect: ILayoutRect) =>
      rect.left >= 4 &&
      rect.left + rect.width <= width - 4 &&
      rect.top >= 4 &&
      rect.top + rect.height <= height - 4 &&
      !placed.some((previous) => rectanglesOverlap(rect, previous)) &&
      !markerRects.some((marker) => rectanglesOverlap(rect, marker, 1))
    for (const offsetY of verticalOffsets) {
      for (const column of columns) {
        const rect = {
          left: column.left,
          top: anchorY + offsetY - size.height / 2,
          ...size,
        }
        if (!isAvailable(rect)) continue
        chosen = rect
        align = column.side
        anchored =
          offsetY === 0 &&
          (column.left === position.left + MARKER_GAP ||
            column.left === position.left - MARKER_GAP - size.width)
        break
      }
      if (chosen) break
    }

    if (!chosen) {
      // 密集场景必须遍历容器空位，不能用可能碰撞的夹紧矩形作为首选回退。
      const maxLeft = width - 4 - size.width
      const maxTop = height - 4 - size.height
      const fallbackCandidates: ILayoutRect[] = []
      for (let top = 4; top <= maxTop; top += 4) {
        for (let left = 4; left <= maxLeft; left += 4) {
          fallbackCandidates.push({ left, top, ...size })
        }
      }
      fallbackCandidates.push(
        { left: maxLeft, top: 4, ...size },
        { left: 4, top: maxTop, ...size },
        { left: maxLeft, top: maxTop, ...size },
      )
      chosen = fallbackCandidates
        .filter(isAvailable)
        .sort((left, right) => {
          const leftDistance = Math.hypot(
            left.left + left.width / 2 - position.left,
            left.top + left.height / 2 - anchorY,
          )
          const rightDistance = Math.hypot(
            right.left + right.width / 2 - position.left,
            right.top + right.height / 2 - anchorY,
          )
          return leftDistance - rightDistance
        })[0]
    }

    if (!chosen) {
      chosen = {
        left: Math.max(4, Math.min(width - 4 - size.width, position.left + MARKER_GAP)),
        top: Math.max(4, Math.min(height - 4 - size.height, anchorY - size.height / 2)),
        ...size,
      }
      align = preferred
    }

    placed.push(chosen)
    layouts[index] = { ...chosen, align, anchored }
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

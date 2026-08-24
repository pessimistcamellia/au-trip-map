export type ScrollDirection = 'up' | 'down' | null

interface IBottomNavVisibilityInput {
  currentY: number
  direction: ScrollDirection
  directionDistance: number
  viewportHeight: number
  documentHeight: number
  currentVisible: boolean
}

const TOP_EDGE = 16
const BOTTOM_EDGE = 48
const HIDE_DISTANCE = 64
const SHOW_DISTANCE = 18

export function getBottomNavVisibility({
  currentY,
  direction,
  directionDistance,
  viewportHeight,
  documentHeight,
  currentVisible,
}: IBottomNavVisibilityInput): boolean {
  if (currentY <= TOP_EDGE) return true
  if (currentY + viewportHeight >= documentHeight - BOTTOM_EDGE) return true
  if (direction === 'down' && directionDistance >= HIDE_DISTANCE) return false
  if (direction === 'up' && directionDistance >= SHOW_DISTANCE) return true
  return currentVisible
}

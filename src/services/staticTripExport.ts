import type { IJournalEntryWithPhotos, ITripData } from '../types'
import { buildNavigationUrl, getPlacesForDay } from '../utils/trip'
import { getPlaceDetailLinks, getPlaceDetailSections } from './placeDetails'

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function safeUrl(value: string): string {
  try {
    const url = new URL(value)
    return ['https:', 'data:'].includes(url.protocol) ? escapeHtml(url.href) : '#'
  } catch {
    return '#'
  }
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export async function generateStaticTripHtml(
  data: ITripData,
  journals: IJournalEntryWithPhotos[] = [],
): Promise<string> {
  const photos = new Map<string, string>()
  await Promise.all(
    journals.flatMap((entry) =>
      entry.photos.map(async (photo) => {
        photos.set(photo.id, await blobToDataUrl(photo.blob))
      }),
    ),
  )
  const days = data.days
    .map((day) => {
      const places = getPlacesForDay(data.places, day.day)
        .map((place) => {
          const details = getPlaceDetailSections(place)
            .filter((section) => section.items.length)
            .map(
              (section) =>
                `<section><h4>${escapeHtml(section.category)}</h4>${section.items.map((item) => `<p>${escapeHtml(item)}</p>`).join('')}</section>`,
            )
            .join('')
          const links = getPlaceDetailLinks(place)
            .map(
              (link) =>
                `<li><a href="${safeUrl(link.url)}">${escapeHtml(link.label)}</a></li>`,
            )
            .join('')
          const navigation = buildNavigationUrl(place)
          return `<article class="place"><h3><span>${place.sequence ?? '—'}</span>${escapeHtml(place.name)}${place.priority === 'optional' ? '<em>可选</em>' : ''}</h3><p>${escapeHtml(place.duration)} · ${escapeHtml(place.transport)}</p>${navigation ? `<a href="${safeUrl(navigation)}">Google Maps 导航</a>` : '<small>无坐标，未上图</small>'}${details}${links ? `<h4>延伸阅读</h4><ul>${links}</ul>` : ''}</article>`
        })
        .join('')
      const dayJournals = journals
        .filter((entry) => entry.day === day.day)
        .map((entry) => {
          const place = data.places.find((item) => item.id === entry.placeId)
          return `<article class="journal"><small>${escapeHtml(place?.name)} · ${escapeHtml(new Date(entry.createdAt).toLocaleString('zh-CN'))}</small><p>${escapeHtml(entry.text)}</p><div class="photos">${entry.photoIds.map((id) => `<img src="${safeUrl(photos.get(id) ?? '')}" alt="随手记照片">`).join('')}</div></article>`
        })
        .join('')
      return `<section class="day"><header><small>第 ${day.day} 天 · ${escapeHtml(day.date)} ${escapeHtml(day.weekday)}</small><h2>${escapeHtml(day.region)}</h2><p>${escapeHtml(day.route)}</p></header><h3>文字行程</h3><p class="pre">${escapeHtml(day.schedule)}</p>${places || '<p>本日没有澳洲地图点位。</p>'}${dayJournals ? `<h3>随手记</h3>${dayJournals}` : ''}</section>`
    })
    .join('')
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(data.trip.name)} · 离线路书</title><style>:root{color-scheme:light;--bg:#fafaf7;--paper:#ffffff;--text:#30322f;--muted:#63675f;--accent:#f4cb4f;--accent-strong:#715a00;--accent-soft:#fff7d6;--on-accent:#2b280f;--line:#e6e7df}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.65 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif}main{width:min(100% - 28px,760px);margin:auto;padding:28px 0 60px}h1,h2,h3,h4,p{margin-top:0}h1{font-size:32px;line-height:1.1}.notice{padding:12px;border-left:4px solid var(--accent);background:var(--accent-soft)}.day{margin-top:28px;padding:20px;background:var(--paper);border:1px solid var(--line);box-shadow:0 4px 16px rgba(65,62,43,.06)}.day>header{border-bottom:2px solid var(--accent);margin-bottom:18px}.place{padding:16px 0;border-top:1px solid var(--line)}.place h3{display:flex;gap:8px;align-items:center}.place h3 span{display:grid;width:28px;height:28px;place-items:center;background:var(--accent);color:var(--on-accent);border-radius:50%}.place em{font-size:12px;color:var(--accent-strong)}a{color:var(--accent-strong)}.pre{white-space:pre-line}.journal{padding:12px 0;border-top:1px dashed var(--line)}.photos{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.photos img{width:100%;aspect-ratio:1;object-fit:cover}@media print{body{background:white}.day{break-inside:avoid}}</style></head><body><main><h1>${escapeHtml(data.trip.name)}</h1><p>${escapeHtml(data.trip.dates)}</p><p class="notice">这是可离线打开的静态副本。地图瓦片、实时天气与外部网站仍需联网；${journals.length ? '已按你的选择包含本机随手记。' : '默认未包含本机随手记。'}</p>${days}</main></body></html>`
}

export function downloadHtml(html: string, filename: string): void {
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

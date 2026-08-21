import type { IJournalPhoto } from '../types'

export async function compressJournalPhoto(
  file: File,
  maxDimension = 1600,
  quality = 0.78,
): Promise<Omit<IJournalPhoto, 'id'>> {
  const bitmap = await createImageBitmap(file)
  const ratio = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * ratio))
  canvas.height = Math.max(1, Math.round(bitmap.height * ratio))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('当前浏览器无法处理照片')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => (value ? resolve(value) : reject(new Error('照片压缩失败'))),
      'image/jpeg',
      quality,
    )
  })
  return {
    blob,
    name: file.name.replace(/\.[^.]+$/, '') + '.jpg',
    type: 'image/jpeg',
  }
}

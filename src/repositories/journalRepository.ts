import type {
  IJournalEntry,
  IJournalEntryWithPhotos,
  IJournalPhoto,
} from '../types'

export const MAX_JOURNAL_PHOTOS = 10

export interface IJournalDraft {
  placeId: string
  day: number
  date: string
  text: string
  photos: Array<Omit<IJournalPhoto, 'id'>>
}

export interface IJournalRepository {
  list(placeId?: string): Promise<IJournalEntryWithPhotos[]>
  create(draft: IJournalDraft): Promise<IJournalEntryWithPhotos>
  update(entryId: string, text: string): Promise<IJournalEntryWithPhotos | null>
  delete(entryId: string): Promise<void>
}

export function groupJournalsByDate(
  entries: IJournalEntryWithPhotos[],
): Array<[string, IJournalEntryWithPhotos[]]> {
  const groups = new Map<string, IJournalEntryWithPhotos[]>()
  entries.forEach((entry) => {
    groups.set(entry.date, [...(groups.get(entry.date) ?? []), entry])
  })
  return [...groups.entries()].sort(([left], [right]) => right.localeCompare(left))
}

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`
}

function validateDraft(draft: IJournalDraft): void {
  if (!draft.text.trim() && !draft.photos.length) {
    throw new Error('日志正文和照片不能同时为空')
  }
  if (draft.photos.length > MAX_JOURNAL_PHOTOS) {
    throw new Error(`每篇日志最多 ${MAX_JOURNAL_PHOTOS} 张照片`)
  }
}

export class InMemoryJournalRepository implements IJournalRepository {
  protected entries: IJournalEntry[] = []
  protected photos = new Map<string, IJournalPhoto>()

  async list(placeId?: string): Promise<IJournalEntryWithPhotos[]> {
    return this.entries
      .filter((entry) => !placeId || entry.placeId === placeId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map((entry) => ({
        ...entry,
        photos: entry.photoIds
          .map((id) => this.photos.get(id))
          .filter((photo): photo is IJournalPhoto => Boolean(photo)),
      }))
  }

  async create(draft: IJournalDraft): Promise<IJournalEntryWithPhotos> {
    validateDraft(draft)
    const now = new Date().toISOString()
    const photos = draft.photos.map((photo) => ({
      ...photo,
      id: createId('photo'),
    }))
    photos.forEach((photo) => this.photos.set(photo.id, photo))
    const entry: IJournalEntry = {
      id: createId('journal'),
      placeId: draft.placeId,
      day: draft.day,
      date: draft.date,
      text: draft.text.trim(),
      photoIds: photos.map((photo) => photo.id),
      createdAt: now,
      updatedAt: now,
    }
    this.entries.push(entry)
    return { ...entry, photos }
  }

  async update(entryId: string, text: string): Promise<IJournalEntryWithPhotos | null> {
    const entry = this.entries.find((item) => item.id === entryId)
    if (!entry) return null
    entry.text = text.trim()
    entry.updatedAt = new Date().toISOString()
    return (await this.list()).find((item) => item.id === entryId) ?? null
  }

  async delete(entryId: string): Promise<void> {
    const entry = this.entries.find((item) => item.id === entryId)
    entry?.photoIds.forEach((id) => this.photos.delete(id))
    this.entries = this.entries.filter((item) => item.id !== entryId)
  }
}

interface ISerializedJournalPhoto extends Omit<IJournalPhoto, 'blob'> {
  dataUrl: string
}

const FALLBACK_STORAGE_KEY = 'au-trip-map:journals:v1'

async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export class LocalStorageJournalRepository extends InMemoryJournalRepository {
  private loaded = false

  private async loadOnce(): Promise<void> {
    if (this.loaded) return
    this.loaded = true
    try {
      const saved = JSON.parse(localStorage.getItem(FALLBACK_STORAGE_KEY) ?? '[]') as Array<{
        entry: IJournalEntry
        photos: ISerializedJournalPhoto[]
      }>
      for (const value of saved.sort((left, right) =>
        left.entry.createdAt.localeCompare(right.entry.createdAt),
      )) {
        this.entries.push(value.entry)
        for (const photo of value.photos) {
          this.photos.set(photo.id, {
            id: photo.id,
            name: photo.name,
            type: photo.type,
            blob: await (await fetch(photo.dataUrl)).blob(),
          })
        }
      }
    } catch {
      localStorage.removeItem(FALLBACK_STORAGE_KEY)
    }
  }

  private async persist(): Promise<void> {
    const entries = await super.list()
    const values = await Promise.all(
      entries.map(async (entry) => ({
        entry: { ...entry, photos: undefined },
        photos: await Promise.all(
          entry.photos.map(async (photo) => ({
            id: photo.id,
            name: photo.name,
            type: photo.type,
            dataUrl: await blobToDataUrl(photo.blob),
          })),
        ),
      })),
    )
    localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(values))
  }

  override async list(placeId?: string): Promise<IJournalEntryWithPhotos[]> {
    await this.loadOnce()
    return super.list(placeId)
  }

  override async create(draft: IJournalDraft): Promise<IJournalEntryWithPhotos> {
    await this.loadOnce()
    const entry = await super.create(draft)
    await this.persist()
    return entry
  }

  override async update(entryId: string, text: string) {
    await this.loadOnce()
    const entry = await super.update(entryId, text)
    await this.persist()
    return entry
  }

  override async delete(entryId: string): Promise<void> {
    await this.loadOnce()
    await super.delete(entryId)
    await this.persist()
  }
}

const DB_NAME = 'au-trip-map-journal'
const DB_VERSION = 1

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains('entries')) {
        const store = database.createObjectStore('entries', { keyPath: 'id' })
        store.createIndex('placeId', 'placeId')
      }
      if (!database.objectStoreNames.contains('photos')) {
        database.createObjectStore('photos', { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function requestValue<Result>(request: IDBRequest<Result>): Promise<Result> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export class IndexedDbJournalRepository implements IJournalRepository {
  async list(placeId?: string): Promise<IJournalEntryWithPhotos[]> {
    const database = await openDatabase()
    const transaction = database.transaction(['entries', 'photos'], 'readonly')
    const entryStore = transaction.objectStore('entries')
    const entries = placeId
      ? await requestValue(entryStore.index('placeId').getAll(placeId))
      : await requestValue(entryStore.getAll())
    const photoStore = transaction.objectStore('photos')
    const results = await Promise.all(
      (entries as IJournalEntry[]).map(async (entry) => ({
        ...entry,
        photos: (
          await Promise.all(
            entry.photoIds.map((id) =>
              requestValue(photoStore.get(id) as IDBRequest<IJournalPhoto | undefined>),
            ),
          )
        ).filter((photo): photo is IJournalPhoto => Boolean(photo)),
      })),
    )
    database.close()
    return results.sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  }

  async create(draft: IJournalDraft): Promise<IJournalEntryWithPhotos> {
    validateDraft(draft)
    const database = await openDatabase()
    const transaction = database.transaction(['entries', 'photos'], 'readwrite')
    const now = new Date().toISOString()
    const photos = draft.photos.map((photo) => ({ ...photo, id: createId('photo') }))
    const entry: IJournalEntry = {
      id: createId('journal'),
      placeId: draft.placeId,
      day: draft.day,
      date: draft.date,
      text: draft.text.trim(),
      photoIds: photos.map((photo) => photo.id),
      createdAt: now,
      updatedAt: now,
    }
    photos.forEach((photo) => transaction.objectStore('photos').put(photo))
    transaction.objectStore('entries').put(entry)
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
    database.close()
    return { ...entry, photos }
  }

  async update(entryId: string, text: string): Promise<IJournalEntryWithPhotos | null> {
    const entries = await this.list()
    const entry = entries.find((item) => item.id === entryId)
    if (!entry) return null
    const database = await openDatabase()
    const transaction = database.transaction('entries', 'readwrite')
    transaction.objectStore('entries').put({
      ...entry,
      photos: undefined,
      text: text.trim(),
      updatedAt: new Date().toISOString(),
    })
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
    database.close()
    return (await this.list()).find((item) => item.id === entryId) ?? null
  }

  async delete(entryId: string): Promise<void> {
    const entry = (await this.list()).find((item) => item.id === entryId)
    if (!entry) return
    const database = await openDatabase()
    const transaction = database.transaction(['entries', 'photos'], 'readwrite')
    transaction.objectStore('entries').delete(entryId)
    entry.photoIds.forEach((id) => transaction.objectStore('photos').delete(id))
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
    database.close()
  }
}

export const journalRepository: IJournalRepository =
  typeof indexedDB === 'undefined'
    ? typeof localStorage === 'undefined'
      ? new InMemoryJournalRepository()
      : new LocalStorageJournalRepository()
    : new IndexedDbJournalRepository()

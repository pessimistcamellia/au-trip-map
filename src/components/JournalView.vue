<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  groupJournalsByDate,
  journalRepository,
  MAX_JOURNAL_PHOTOS,
} from '../repositories/journalRepository'
import { compressJournalPhoto } from '../services/photoCompression'
import type {
  IJournalEntryWithPhotos,
  IJournalPhoto,
  IPlace,
  ITripData,
} from '../types'

const props = defineProps<{
  data: ITripData
  place?: IPlace
}>()

const emit = defineEmits<{
  back: []
  openPlace: [place: IPlace]
}>()

const text = ref('')
const pendingPhotos = ref<Array<Omit<IJournalPhoto, 'id'> & { preview: string }>>([])
const entries = ref<IJournalEntryWithPhotos[]>([])
const notice = ref('')
const saving = ref(false)
const storedPhotoUrls = new Map<string, string>()

const groupedEntries = computed(() => groupJournalsByDate(entries.value))

function placeFor(entry: IJournalEntryWithPhotos): IPlace | undefined {
  return props.data.places.find((place) => place.id === entry.placeId)
}

async function loadEntries(): Promise<void> {
  storedPhotoUrls.forEach((url) => URL.revokeObjectURL(url))
  storedPhotoUrls.clear()
  entries.value = await journalRepository.list(props.place?.id)
}

function removePending(index: number): void {
  URL.revokeObjectURL(pendingPhotos.value[index].preview)
  pendingPhotos.value.splice(index, 1)
}

async function choosePhotos(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const files = [...(input.files ?? [])]
  const remaining = MAX_JOURNAL_PHOTOS - pendingPhotos.value.length
  if (files.length > remaining) {
    notice.value = `每篇最多 ${MAX_JOURNAL_PHOTOS} 张，已为你保留前 ${remaining} 张`
  }
  for (const file of files.slice(0, remaining)) {
    try {
      const photo = await compressJournalPhoto(file)
      pendingPhotos.value.push({ ...photo, preview: URL.createObjectURL(photo.blob) })
    } catch (error) {
      notice.value = error instanceof Error ? error.message : '照片处理失败'
    }
  }
  input.value = ''
}

async function save(): Promise<void> {
  if (!props.place || saving.value) return
  if (!text.value.trim() && !pendingPhotos.value.length) {
    notice.value = '写点内容或添加照片后再保存'
    return
  }
  saving.value = true
  try {
    await journalRepository.create({
      placeId: props.place.id,
      day: props.place.day ?? 0,
      date: props.place.date ?? '',
      text: text.value,
      photos: pendingPhotos.value.map(({ preview: _, ...photo }) => photo),
    })
    pendingPhotos.value.forEach((photo) => URL.revokeObjectURL(photo.preview))
    pendingPhotos.value = []
    text.value = ''
    notice.value = '已保存在本机'
    await loadEntries()
  } catch (error) {
    notice.value = error instanceof Error ? error.message : '保存失败'
  } finally {
    saving.value = false
  }
}

async function removeEntry(entryId: string): Promise<void> {
  await journalRepository.delete(entryId)
  notice.value = '日志已删除'
  await loadEntries()
}

function photoUrl(photo: IJournalPhoto): string {
  const existing = storedPhotoUrls.get(photo.id)
  if (existing) return existing
  const url = URL.createObjectURL(photo.blob)
  storedPhotoUrls.set(photo.id, url)
  return url
}

onMounted(loadEntries)
onBeforeUnmount(() => {
  pendingPhotos.value.forEach((photo) => URL.revokeObjectURL(photo.preview))
  storedPhotoUrls.forEach((url) => URL.revokeObjectURL(url))
})
</script>

<template>
  <section class="journal-page">
    <header class="journal-page-header">
      <button type="button" @click="emit('back')">
        <van-icon name="arrow-left" /> 返回
      </button>
      <div>
        <small>{{ place ? `第 ${place.day} 天` : '全部行程' }}</small>
        <h2>{{ place ? `${place.name} · 随手记` : '旅途日志' }}</h2>
        <p>文字和照片仅保存在这台设备，不会自动云同步。</p>
      </div>
    </header>

    <section v-if="place" class="journal-editor">
      <label for="journal-text">写下这一刻</label>
      <textarea
        id="journal-text"
        v-model="text"
        rows="5"
        placeholder="天气、路况、停车位置，或此刻最想记住的事"
      />
      <div v-if="pendingPhotos.length" class="pending-photo-grid">
        <figure v-for="(photo, index) in pendingPhotos" :key="photo.preview">
          <img :src="photo.preview" :alt="`待保存照片 ${index + 1}`">
          <button type="button" :aria-label="`删除第 ${index + 1} 张照片`" @click="removePending(index)">
            <van-icon name="cross" />
          </button>
        </figure>
      </div>
      <div class="journal-editor-actions">
        <label class="photo-picker">
          <van-icon name="photo-o" />
          添加照片
          <input type="file" accept="image/*" multiple @change="choosePhotos">
        </label>
        <span>{{ pendingPhotos.length }}/{{ MAX_JOURNAL_PHOTOS }}</span>
        <button type="button" :disabled="saving" @click="save">
          {{ saving ? '保存中…' : '保存日志' }}
        </button>
      </div>
      <p v-if="notice" class="journal-notice" role="status">{{ notice }}</p>
    </section>

    <section class="journal-history">
      <div class="section-heading">
        <h2>{{ place ? '这个地点的记录' : '按日期查看' }}</h2>
        <span>{{ entries.length }} 篇</span>
      </div>
      <div v-if="!entries.length" class="journal-empty">
        <van-icon name="records-o" />
        <strong>还没有日志</strong>
        <p>{{ place ? '第一篇可以很短，照片也可以以后再补。' : '从任一目的地的“随手记”开始记录。' }}</p>
      </div>
      <template v-for="[date, values] in groupedEntries" :key="date">
        <h3 v-if="!place" class="journal-date">{{ date }}</h3>
        <article v-for="entry in values" :key="entry.id" class="journal-entry">
          <header>
            <button
              v-if="!place && placeFor(entry)"
              type="button"
              @click="emit('openPlace', placeFor(entry)!)"
            >
              {{ placeFor(entry)?.name }}
            </button>
            <time>{{ new Date(entry.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</time>
            <button type="button" aria-label="删除这篇日志" @click="removeEntry(entry.id)">
              删除
            </button>
          </header>
          <p v-if="entry.text">{{ entry.text }}</p>
          <div v-if="entry.photos.length" class="journal-photo-grid">
            <img
              v-for="photo in entry.photos"
              :key="photo.id"
              :src="photoUrl(photo)"
              :alt="`${placeFor(entry)?.name ?? '旅途'}日志照片`"
            >
          </div>
        </article>
      </template>
    </section>
  </section>
</template>

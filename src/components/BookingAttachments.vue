<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { IPlaceAttachment } from '../types'

const props = defineProps<{
  attachments: IPlaceAttachment[]
}>()

const preview = ref<IPlaceAttachment | null>(null)

const baseUrl = import.meta.env.BASE_URL || '/'

function assetUrl(attachment: IPlaceAttachment): string {
  const raw = attachment.url || `bookings/${attachment.file}`
  const path = raw.replace(/^\//, '')
  return `${baseUrl}${path}`
}

const previewUrl = computed(() => (preview.value ? assetUrl(preview.value) : ''))

function openPreview(attachment: IPlaceAttachment) {
  // iOS Safari 对 iframe 内嵌 PDF 支持差；优先新窗口打开官方文件，便于出示
  const url = assetUrl(attachment)
  if (attachment.kind === 'pdf') {
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }
  preview.value = attachment
}

function closePreview() {
  preview.value = null
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && preview.value) {
    event.preventDefault()
    closePreview()
  }
}

watch(preview, (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <section v-if="attachments.length" class="booking-attachments" id="booking-files">
    <header>
      <h3>预订文件</h3>
      <p>点下面按钮打开官方确认单／二维码，可直接出示给工作人员。</p>
    </header>

    <button
      v-for="item in attachments"
      :key="item.id"
      type="button"
      class="booking-card"
      @click="openPreview(item)"
    >
      <div class="booking-card-meta">
        <strong>{{ item.title }}</strong>
        <p v-if="item.summary">{{ item.summary }}</p>
        <ul v-if="item.orderRef || item.confirmRef">
          <li v-if="item.confirmRef">确认号：{{ item.confirmRef }}</li>
          <li v-if="item.orderRef">订单号：{{ item.orderRef }}</li>
        </ul>
      </div>
      <span class="booking-open">
        <van-icon :name="item.kind === 'pdf' ? 'description' : 'photo-o'" />
        {{ item.kind === 'pdf' ? '打开 PDF 预订文件' : '全屏查看预订截图' }}
      </span>
    </button>
  </section>

  <Teleport to="body">
    <div
      v-if="preview"
      class="booking-preview"
      role="dialog"
      aria-modal="true"
      :aria-label="preview.title"
    >
      <header class="booking-preview-bar">
        <div>
          <strong>{{ preview.title }}</strong>
          <span v-if="preview.confirmRef || preview.orderRef">
            {{ preview.confirmRef || preview.orderRef }}
          </span>
        </div>
        <button type="button" class="booking-close" @click="closePreview">
          关闭
        </button>
      </header>
      <div class="booking-preview-body">
        <img :src="previewUrl" :alt="preview.title" />
      </div>
      <footer class="booking-preview-foot">
        <a :href="previewUrl" target="_blank" rel="noreferrer">在新窗口打开</a>
        <button type="button" @click="closePreview">返回路书</button>
      </footer>
    </div>
  </Teleport>
</template>

<style scoped>
.booking-attachments {
  display: grid;
  gap: 0.75rem;
  margin: 0 0 1rem;
  padding: 0.9rem;
  border-radius: 16px;
  background: var(--accent-soft);
  border: 1.5px solid color-mix(in srgb, var(--accent-strong) 22%, var(--line));
}

.booking-attachments header h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--accent-strong);
}

.booking-attachments header p {
  margin: 0.3rem 0 0;
  color: var(--muted);
  font-size: 0.82rem;
  line-height: 1.4;
}

.booking-card {
  display: grid;
  gap: 0.7rem;
  width: 100%;
  padding: 0.85rem 0.9rem;
  border-radius: 14px;
  background: var(--surface);
  border: 1px solid var(--line);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  appearance: none;
}

.booking-card:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--accent-strong) 55%, transparent);
  outline-offset: 2px;
}

.booking-card-meta strong {
  display: block;
  font-size: 0.95rem;
  line-height: 1.35;
  color: var(--text);
}

.booking-card-meta p,
.booking-card-meta li {
  margin: 0.35rem 0 0;
  color: var(--muted);
  font-size: 0.78rem;
  line-height: 1.45;
}

.booking-card-meta ul {
  margin: 0.35rem 0 0;
  padding-left: 1rem;
}

.booking-open,
.booking-close,
.booking-preview-foot button {
  appearance: none;
  border: 0;
  border-radius: 999px;
  padding: 0.65rem 0.95rem;
  background: var(--accent);
  color: var(--on-accent);
  font: inherit;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
}

.booking-open {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  justify-self: start;
}

.booking-preview {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: #10140f;
  color: #f4f7f2;
}

.booking-preview-bar,
.booking-preview-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  padding-top: calc(0.85rem + env(safe-area-inset-top));
  background: #171c16;
}

.booking-preview-foot {
  padding-bottom: calc(0.85rem + env(safe-area-inset-bottom));
}

.booking-preview-bar strong {
  display: block;
  font-size: 0.95rem;
}

.booking-preview-bar span {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.75rem;
  opacity: 0.75;
}

.booking-preview-body {
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  background: #0c0f0b;
}

.booking-preview-body img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  background: #0c0f0b;
}

.booking-preview-foot a {
  color: #d7e7d5;
  font-size: 0.85rem;
}

.booking-close,
.booking-preview-foot button {
  background: #f0f5ee;
  color: #152016;
}
</style>

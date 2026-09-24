<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { IPlaceAttachment } from '../types'

const props = defineProps<{
  attachments: IPlaceAttachment[]
}>()

const preview = ref<IPlaceAttachment | null>(null)

const baseUrl = import.meta.env.BASE_URL || '/'

function assetUrl(attachment: IPlaceAttachment): string {
  const path = attachment.url.replace(/^\//, '')
  return `${baseUrl}${path}`
}

const previewUrl = computed(() => (preview.value ? assetUrl(preview.value) : ''))

function openPreview(attachment: IPlaceAttachment) {
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
  <section v-if="attachments.length" class="booking-attachments">
    <header>
      <h3>预订文件</h3>
      <p>点开可全屏出示给前台／工作人员；默认折叠，不挡行程正文。</p>
    </header>

    <article
      v-for="item in attachments"
      :key="item.id"
      class="booking-card"
      role="button"
      tabindex="0"
      @click="openPreview(item)"
      @keydown.enter.prevent="openPreview(item)"
      @keydown.space.prevent="openPreview(item)"
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
        查看预订文件
      </span>
    </article>
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
        <iframe
          v-if="preview.kind === 'pdf'"
          :src="previewUrl"
          title="预订文件 PDF"
        />
        <img
          v-else
          :src="previewUrl"
          :alt="preview.title"
        />
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
  margin: 0 1rem 0.85rem;
  padding: 0.85rem;
  border-radius: 16px;
  background: color-mix(in srgb, #e7f0e4 70%, var(--paper));
  border: 1px solid color-mix(in srgb, #2f5d4a 18%, transparent);
}

.booking-attachments header h3 {
  margin: 0;
  font-size: 0.95rem;
}

.booking-attachments header p {
  margin: 0.25rem 0 0;
  color: color-mix(in srgb, var(--ink) 62%, transparent);
  font-size: 0.8rem;
  line-height: 1.4;
}

.booking-card {
  display: grid;
  gap: 0.65rem;
  padding: 0.75rem 0.85rem;
  border-radius: 14px;
  background: color-mix(in srgb, var(--paper) 92%, #fff);
  border: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
  cursor: pointer;
}

.booking-card:focus-visible {
  outline: 2px solid color-mix(in srgb, #2f5d4a 70%, transparent);
  outline-offset: 2px;
}

.booking-card-meta strong {
  display: block;
  font-size: 0.92rem;
  line-height: 1.35;
}

.booking-card-meta p,
.booking-card-meta li {
  margin: 0.35rem 0 0;
  color: color-mix(in srgb, var(--ink) 70%, transparent);
  font-size: 0.78rem;
  line-height: 1.45;
}

.booking-card-meta ul {
  margin: 0.35rem 0 0;
  padding-left: 1rem;
}

.booking-close,
.booking-preview-foot button {
  appearance: none;
  border: 0;
  border-radius: 999px;
  padding: 0.55rem 0.9rem;
  background: color-mix(in srgb, var(--ink) 88%, #2f5d4a);
  color: #f7faf6;
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
}

.booking-open {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  justify-self: start;
  border-radius: 999px;
  padding: 0.55rem 0.9rem;
  background: color-mix(in srgb, var(--ink) 88%, #2f5d4a);
  color: #f7faf6;
  font-size: 0.85rem;
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

.booking-preview-body iframe,
.booking-preview-body img {
  display: block;
  width: 100%;
  min-height: 100%;
  border: 0;
  background: #fff;
}

.booking-preview-body img {
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

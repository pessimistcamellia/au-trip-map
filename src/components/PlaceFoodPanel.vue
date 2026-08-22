<script setup lang="ts">
import type { IPlaceFood } from '../types'
import { buildNavigationUrl } from '../utils/trip'

const props = defineProps<{
  food: IPlaceFood
  online: boolean
}>()

function ratingText(rating: number | null, count: number | null): string {
  if (rating === null) return '暂无可核实评分'
  return count === null ? `${rating}` : `${rating}（${count} 条评价）`
}
</script>

<template>
  <div class="food-panel">
    <p v-if="props.food.summary" class="food-summary">{{ props.food.summary }}</p>

    <article v-for="item in props.food.restaurants" :key="item.name" class="food-card">
      <header>
        <div>
          <strong>{{ item.name }}</strong>
          <small v-if="item.nameEn && item.nameEn !== item.name">{{ item.nameEn }}</small>
        </div>
        <a
          v-if="item.lat !== null && item.lng !== null"
          class="place-navigate"
          :href="props.online ? buildNavigationUrl({ lat: item.lat, lng: item.lng }) : undefined"
          :aria-disabled="!props.online"
          :aria-label="`在 Google 地图导航到 ${item.name}`"
          :title="props.online ? '在 Google 地图导航' : '离线状态不可导航'"
          target="_blank"
          rel="noreferrer"
        ><van-icon name="guide-o" /></a>
      </header>

      <p class="food-meta">
        <span class="food-rating" :class="{ unknown: item.rating === null }">
          <van-icon name="star" />
          {{ ratingText(item.rating, item.ratingCount) }}
        </span>
        <span v-if="item.cuisine">{{ item.cuisine }}</span>
        <span v-if="item.priceLevel">{{ item.priceLevel }}</span>
      </p>

      <p v-if="item.distance || item.hours" class="food-where">
        <span v-if="item.distance">{{ item.distance }}</span>
        <span v-if="item.hours">{{ item.hours }}</span>
      </p>

      <p v-if="item.recommended">{{ item.recommended }}</p>

      <p v-if="item.ratingSource || item.sourceUrl" class="food-source">
        <span v-if="item.ratingSource">
          {{ item.ratingSource }}<template v-if="item.ratingCheckedAt">
            · {{ item.ratingCheckedAt }} 核对</template>
        </span>
        <a v-if="item.sourceUrl" :href="item.sourceUrl" target="_blank" rel="noreferrer">
          查看来源 <van-icon name="share-o" />
        </a>
      </p>
    </article>
  </div>
</template>

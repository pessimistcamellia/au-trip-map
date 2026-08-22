<script setup lang="ts">
import type { ILink, IWeatherReference } from '../types'

const props = defineProps<{
  placeName: string
  reference: IWeatherReference
  links: ILink[]
  online: boolean
}>()
</script>

<template>
  <div class="weather-panel">
    <p class="weather-scope">{{ props.placeName }}</p>
    <p v-if="props.reference.temperatureRange" class="weather-temperature">
      {{ props.reference.temperatureRange }}
    </p>
    <p class="weather-source">长年气候参考，非逐日预报</p>

    <p v-if="props.reference.granularity !== 'place' && props.reference.basis" class="weather-basis">
      本点无独立气候数据，采用最近的{{ props.reference.basis }}作为参考
    </p>

    <p v-if="props.reference.note">{{ props.reference.note }}</p>

    <p class="weather-missing">
      降水概率与强度、湿度、紫外线与晴朗指数需逐日预报，出发前 7 天内查 BOM 官方预报。
    </p>

    <template v-if="props.reference.dayAdvisory">
      <h5>当日共同提示</h5>
      <p>{{ props.reference.dayAdvisory }}</p>
    </template>

    <p v-if="props.links.length" class="weather-links">
      <a
        v-for="link in props.links"
        :key="link.url"
        :href="props.online ? link.url : undefined"
        :aria-disabled="!props.online"
        target="_blank"
        rel="noreferrer"
      >
        {{ link.label }} <van-icon name="share-o" />
      </a>
    </p>
  </div>
</template>

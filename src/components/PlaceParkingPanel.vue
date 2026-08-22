<script setup lang="ts">
import type { IPlaceParking, ParkingFee } from '../types'
import { buildNavigationUrl } from '../utils/trip'

const props = defineProps<{
  parking: IPlaceParking
  online: boolean
}>()

const FEE_LABELS: Record<ParkingFee, string> = {
  free: '免费',
  paid: '收费',
  mixed: '部分收费',
  unknown: '收费情况待确认',
}
</script>

<template>
  <section class="parking-panel">
    <h5>停车</h5>
    <p v-if="props.parking.summary" class="parking-summary">{{ props.parking.summary }}</p>

    <article v-for="lot in props.parking.lots" :key="lot.name" class="parking-card">
      <header>
        <div>
          <strong>{{ lot.name }}</strong>
          <span class="parking-fee" :class="lot.fee">{{ FEE_LABELS[lot.fee] }}</span>
        </div>
        <a
          v-if="lot.lat !== null && lot.lng !== null"
          class="place-navigate"
          :href="props.online ? buildNavigationUrl({ lat: lot.lat, lng: lot.lng }) : undefined"
          :aria-disabled="!props.online"
          :aria-label="`在 Google 地图导航到 ${lot.name}`"
          :title="props.online ? '在 Google 地图导航' : '离线状态不可导航'"
          target="_blank"
          rel="noreferrer"
        ><van-icon name="guide-o" /></a>
      </header>
      <p v-if="lot.feeNote || lot.capacity || lot.surface" class="parking-meta">
        <span v-if="lot.feeNote">{{ lot.feeNote }}</span>
        <span v-if="lot.capacity">{{ lot.capacity }}</span>
        <span v-if="lot.surface">{{ lot.surface }}</span>
      </p>
      <p v-if="lot.note">{{ lot.note }}</p>
    </article>

    <ul v-if="props.parking.rules.length" class="parking-rules">
      <li v-for="rule in props.parking.rules" :key="rule">{{ rule }}</li>
    </ul>

    <p v-if="props.parking.sources.length" class="parking-source">
      <a
        v-for="source in props.parking.sources"
        :key="source.url"
        :href="source.url"
        target="_blank"
        rel="noreferrer"
      >
        {{ source.label }} <van-icon name="share-o" />
      </a>
    </p>
  </section>
</template>

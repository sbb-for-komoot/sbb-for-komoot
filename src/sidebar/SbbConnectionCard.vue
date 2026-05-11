<template>
  <div
    class="conn-card"
    role="button"
    tabindex="0"
    @click="$emit('select')"
    @keydown.enter.prevent="$emit('select')"
    @keydown.space.prevent="$emit('select')"
  >
    <div class="conn-header">
      <span class="conn-product-badge" :class="`conn-product--${product.toLowerCase()}`">{{ product }}</span>
      <span class="conn-direction">{{ t('direction', {name: direction}) }}</span>
    </div>
    <div class="conn-journey">
      <span class="conn-time">{{ depTime }}</span>
      <span class="conn-line-wrap" aria-hidden="true">
        <span class="conn-bullet"></span>
        <span class="conn-track"></span>
        <span class="conn-bullet"></span>
        <span
          v-for="(pct, i) in dotPercents"
          :key="i"
          class="conn-dot"
          :style="{ left: `calc(7px + (100% - 14px) * ${pct / 100})` }"
        ></span>
      </span>
      <span class="conn-time">{{ arrTime }}</span>
    </div>
    <div class="conn-footer">
      <span v-if="platform" class="conn-platform">{{ t('platform', {num: platform}) }}</span>
      <span class="conn-duration">{{ durationStr }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'

const {t} = useI18n()

const props = defineProps<{
  depIso: string
  arrIso: string
  platform?: string
  direction: string
  product: string
  sectionStarts?: string[]
}>()

defineEmits<{select: []}>()

const dotPercents = computed<number[]>(() => {
  const start = new Date(props.depIso).getTime()
  const end = new Date(props.arrIso).getTime()
  const total = end - start
  if (!Number.isFinite(total) || total <= 0) return []
  return (props.sectionStarts ?? []).flatMap((iso) => {
    const time = new Date(iso).getTime()
    if (!Number.isFinite(time)) return []
    const pct = ((time - start) / total) * 100
    if (pct < 2 || pct > 98) return []
    return [pct]
  })
})

function fmtTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const depTime = computed(() => fmtTime(props.depIso))
const arrTime = computed(() => fmtTime(props.arrIso))

const durationStr = computed(() => {
  const mins = Math.round((new Date(props.arrIso).getTime() - new Date(props.depIso).getTime()) / 60000)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? t('durationHM', {h, m}) : t('durationM', {m})
})
</script>

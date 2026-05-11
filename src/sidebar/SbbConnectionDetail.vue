<template>
  <Teleport to="body">
    <Transition name="info-fade">
      <div
        v-if="connection"
        class="info-overlay"
        role="dialog"
        aria-modal="true"
        @click.self="$emit('close')"
      >
        <div class="detail-popup">
          <button class="info-popup-close" :aria-label="t('close')" @click="$emit('close')">&times;</button>

          <header class="detail-header">
            <p class="detail-date">{{ dateLabel }}</p>
            <p class="detail-overview">
              <span class="detail-time">{{ fmtTime(connection.from.departure) }}</span>
              <span class="detail-arrow" aria-hidden="true">→</span>
              <span class="detail-time">{{ fmtTime(connection.to.arrival) }}</span>
              <span class="detail-overview-sep">·</span>
              <span class="detail-overview-duration">{{ totalDuration }}</span>
            </p>
          </header>

          <ol class="detail-timeline">
            <li class="detail-stop">
              <span class="detail-stop-bullet detail-stop-bullet--start" aria-hidden="true"></span>
              <div class="detail-stop-body">
                <span class="detail-stop-time">{{ fmtTime(originStopTime) }}</span>
                <span class="detail-stop-name">{{ originStopName }}</span>
                <span v-if="originStopPlatform" class="detail-stop-platform">
                  {{ t('platform', {num: originStopPlatform}) }}
                </span>
              </div>
            </li>

            <template v-for="(s, i) in connection.sections" :key="i">
              <li class="detail-leg" :class="{ 'detail-leg--walk': !s.journey }">
                <span class="detail-leg-rail" aria-hidden="true"></span>
                <div class="detail-leg-body">
                  <template v-if="s.journey">
                    <span
                      class="conn-product-badge"
                      :class="`conn-product--${s.journey.category.toLowerCase()}`"
                    >{{ legBadge(s.journey) }}</span>
                    <span class="detail-leg-direction">
                      {{ t('direction', {name: s.journey.to}) }}
                    </span>
                  </template>
                  <template v-else>
                    <svg
                      class="detail-leg-walk-icon"
                      viewBox="0 0 24 24"
                      role="img"
                      :aria-label="t('walk')"
                    >
                      <title>{{ t('walk') }}</title>
                      <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" />
                    </svg>
                  </template>
                  <span class="detail-leg-duration">{{ legDuration(s) }}</span>
                </div>
              </li>

              <li
                class="detail-stop"
                :class="{ 'detail-stop--final': i === connection.sections.length - 1 }"
              >
                <span
                  class="detail-stop-bullet"
                  :class="{ 'detail-stop-bullet--end': i === connection.sections.length - 1 }"
                  aria-hidden="true"
                ></span>
                <div class="detail-stop-body">
                  <span class="detail-stop-time">{{ fmtTime(s.arrival?.arrival ?? '') }}</span>
                  <span class="detail-stop-name">{{ stopName(s.arrival, i === connection.sections.length - 1) }}</span>
                  <span v-if="s.arrival?.platform" class="detail-stop-platform">
                    {{ t('platform', {num: s.arrival.platform}) }}
                  </span>
                </div>
              </li>
            </template>
          </ol>

          <footer class="detail-footer">
            <a
              class="detail-sbb-link"
              :href="sbbUrl"
              target="_blank"
              rel="noopener noreferrer"
            >{{ t('checkSbb') }}</a>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'

const {t, locale} = useI18n()

interface Stop {
  arrival?: string
  departure?: string
  platform?: string | null
  station?: {name?: string; id?: string | null}
}

interface Journey {
  category: string
  number?: string
  name?: string
  to: string
}

export interface Section {
  journey: Journey | null
  walk?: {duration?: number} | null
  departure?: Stop
  arrival?: Stop
}

export interface Connection {
  from: {departure: string; platform: string | null; station?: {name?: string; id?: string | null}}
  to: {arrival: string; station?: {name?: string; id?: string | null}}
  sections: Section[]
}

const props = defineProps<{
  connection: Connection | null
  fallbackTo?: string
}>()

defineEmits<{close: []}>()

function fmtTime(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// API resolves arbitrary coords to names like "Rigi Staffel, Staffelweg 10 @679127,211521".
// The trailing @lv95-coords suffix is internal — strip it for display.
function cleanName(name: string | undefined): string {
  return (name ?? '').replace(/\s*@-?\d+,-?\d+\s*$/, '')
}

const originStopTime = computed(() =>
  props.connection?.sections[0]?.departure?.departure ?? props.connection?.from.departure ?? ''
)

const originStopName = computed(() =>
  cleanName(
    props.connection?.sections[0]?.departure?.station?.name
      ?? props.connection?.from.station?.name
  )
)

const originStopPlatform = computed(() =>
  props.connection?.sections[0]?.departure?.platform ?? props.connection?.from.platform ?? null
)

function stopName(stop: Stop | undefined, isFinal: boolean): string {
  return cleanName(
    stop?.station?.name
      ?? (isFinal ? props.connection?.to.station?.name ?? props.fallbackTo : undefined)
  )
}

const dateLabel = computed(() => {
  if (!props.connection) return ''
  const d = new Date(props.connection.from.departure)
  const weekday = new Intl.DateTimeFormat(locale.value, {weekday: 'long'}).format(d)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${weekday}, ${dd}.${mm}.${yyyy}`
})

function durationStr(ms: number): string {
  const mins = Math.max(0, Math.round(ms / 60_000))
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? t('durationHM', {h, m}) : t('durationM', {m})
}

const totalDuration = computed(() => {
  if (!props.connection) return ''
  const dep = new Date(props.connection.from.departure).getTime()
  const arr = new Date(props.connection.to.arrival).getTime()
  return durationStr(arr - dep)
})

function legDuration(s: Section): string {
  // Note: don't use s.walk.duration — the API reports 0 for the final
  // coord-to-destination walk even when the section spans several minutes.
  // The section's own dep/arr timestamps are the reliable source.
  const dep = s.departure?.departure ? new Date(s.departure.departure).getTime() : NaN
  const arr = s.arrival?.arrival ? new Date(s.arrival.arrival).getTime() : NaN
  if (!Number.isFinite(dep) || !Number.isFinite(arr)) return ''
  return durationStr(arr - dep)
}

function legBadge(j: Journey): string {
  return j.number ? `${j.category} ${j.number}` : j.category
}

// SBB.ch's URL leaves commas and spaces-as-plus literal in the `stops` value;
// only non-ASCII and the standard reserved chars are percent-encoded.
function sbbEncode(s: string): string {
  return encodeURIComponent(s).replace(/%20/g, '+').replace(/%2C/g, ',')
}

function stopToken(name: string, id: string | null | undefined, coords?: {lng: string; lat: string}): string {
  if (id) return `${sbbEncode(name)}_I${id}`
  // No station id → inject coords with a free-text label SBB will display as-is.
  // The leading space is intentional and matches the " Current location" hack format.
  if (coords) return `${sbbEncode(' Hike departure')}_C${coords.lng},${coords.lat}`
  return sbbEncode(name)
}

const sbbUrl = computed(() => {
  const c = props.connection
  if (!c) return ''

  const fromName = cleanName(c.from.station?.name) || 'Departure'
  const fromToken = stopToken(fromName, c.from.station?.id ?? null)

  // Destination: use the API-resolved station id if present, otherwise fall back
  // to the original Komoot "lng;lat" coordinates with the " Current location" hack.
  const toName = cleanName(c.to.station?.name) || 'Destination'
  let toToken: string
  if (c.to.station?.id) {
    toToken = stopToken(toName, c.to.station.id)
  } else if (props.fallbackTo && props.fallbackTo.includes(';')) {
    const [lng, lat] = props.fallbackTo.split(';')
    toToken = stopToken(toName, null, {lng, lat})
  } else {
    toToken = stopToken(toName, null)
  }

  const dep = new Date(c.from.departure)
  const day = `${dep.getFullYear()}-${String(dep.getMonth() + 1).padStart(2, '0')}-${String(dep.getDate()).padStart(2, '0')}`
  const time = `${String(dep.getHours()).padStart(2, '0')}_${String(dep.getMinutes()).padStart(2, '0')}`

  return `https://www.sbb.ch/${locale.value}?stops=${fromToken}~${toToken}&day=${day}&time=${time}&moment=dep`
})
</script>

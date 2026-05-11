<template>
  <div class="conn-list">
    <template v-if="loading">
      <div v-for="n in 3" :key="n" class="conn-card animate-pulse">
        <div class="conn-header">
          <div class="h-4 w-10 rounded bg-gray-300"></div>
          <div class="h-3 flex-1 rounded bg-gray-200"></div>
        </div>
        <div class="conn-journey">
          <div class="h-4 w-12 rounded bg-gray-300"></div>
          <div class="h-[2px] flex-1 rounded bg-gray-200"></div>
          <div class="h-4 w-12 rounded bg-gray-300"></div>
        </div>
        <div class="conn-footer">
          <div class="h-3 w-10 rounded bg-gray-200"></div>
          <div class="ml-auto h-3 w-12 rounded bg-gray-200"></div>
        </div>
      </div>
    </template>
    <template v-else-if="connections.length > 0">
      <p class="conn-list-date">{{ dateLabel }}</p>
      <button
        type="button"
        class="conn-load-more"
        :class="{ 'animate-pulse': loadingMore === 'earlier' }"
        :disabled="!!loadingMore"
        @click="loadMore('earlier')"
      >
        <span aria-hidden="true">↑</span> {{ t('earlierConnections') }}
      </button>
      <SbbConnectionCard
        v-for="(c, i) in connections"
        :key="c.from.departure + i"
        :dep-iso="c.from.departure"
        :arr-iso="c.to.arrival"
        :platform="c.from.platform ?? undefined"
        :direction="firstJourneyTo(c)"
        :product="firstProduct(c)"
        :section-starts="sectionStarts(c)"
        @select="selectedConnection = c"
      />
      <button
        type="button"
        class="conn-load-more"
        :class="{ 'animate-pulse': loadingMore === 'later' }"
        :disabled="!!loadingMore"
        @click="loadMore('later')"
      >
        <span aria-hidden="true">↓</span> {{ t('laterConnections') }}
      </button>
    </template>
    <p v-else-if="error" class="conn-list-status">{{ error }}</p>
    <p v-else-if="from && to" class="conn-list-status">{{ t('noConnections') }}</p>
    <p v-else class="conn-list-status conn-list-hint">{{ t('connectionHint') }}</p>
    <SbbConnectionDetail
      :connection="selectedConnection"
      :fallback-to="to"
      @close="selectedConnection = null"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, watch, computed, onUnmounted} from 'vue'
import {useI18n} from 'vue-i18n'
import SbbConnectionCard from './SbbConnectionCard.vue'
import SbbConnectionDetail from './SbbConnectionDetail.vue'
import {buildKey, readFresh, write as writeCache} from './connectionsCache'

const {t, locale} = useI18n()

const props = defineProps<{
  from: string
  to: string
  date: string
  time: string
  isArrival: boolean
  paused?: boolean
}>()

interface ApiStop {
  departure?: string
  arrival?: string
  platform?: string | null
  station?: {name?: string; id?: string | null}
}

interface ApiSection {
  journey: {category: string; to: string; number?: string; name?: string} | null
  walk?: {duration?: number} | null
  departure?: ApiStop
  arrival?: ApiStop
}

interface ApiConnection {
  from: {departure: string; platform: string | null; station?: {name?: string; id?: string | null}}
  to: {arrival: string; station?: {name?: string; id?: string | null}}
  sections: ApiSection[]
}

const connections = ref<ApiConnection[]>([])
const loading = ref(false)
const loadingMore = ref<'earlier' | 'later' | null>(null)
const error = ref('')
const selectedConnection = ref<ApiConnection | null>(null)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let abortController: AbortController | null = null

function firstJourneyTo(c: ApiConnection): string {
  return c.sections.find(s => s.journey)?.journey?.to ?? props.to
}

function firstProduct(c: ApiConnection): string {
  return c.sections.find(s => s.journey)?.journey?.category ?? ''
}

function sectionStarts(c: ApiConnection): string[] {
  // Skip section 0 — its departure equals the connection's overall departure (left bullet).
  return c.sections.slice(1).flatMap(s => (s.departure?.departure ? [s.departure.departure] : []))
}

function currentKey(): string {
  return buildKey(props.from, props.to, props.date, props.time, props.isArrival)
}

const dateLabel = computed(() => {
  if (!props.date) return ''
  const d = new Date(props.date + 'T00:00:00')
  const weekday = new Intl.DateTimeFormat(locale.value, {weekday: 'long'}).format(d)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${weekday}, ${dd}.${mm}.${yyyy}`
})

function localDateTime(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mn = String(d.getMinutes()).padStart(2, '0')
  return {date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mn}`}
}

async function fetchPage(opts: {
  date: string
  time: string
  isArrival: boolean
  signal: AbortSignal
}): Promise<ApiConnection[]> {
  // `props.to` is either a station name or coords as "lng;lat" (from Komoot).
  // transport.opendata.ch expects coords as "lat,lng".
  const to = props.to.includes(';')
    ? props.to.split(';').reverse().join(',')
    : props.to
  const params = new URLSearchParams({
    from: props.from,
    to,
    date: opts.date,
    time: opts.time,
    isArrivalTime: opts.isArrival ? '1' : '0',
    limit: '8',
  })
  const res = await fetch(
    `https://transport.opendata.ch/v1/connections?${params.toString()}`,
    {signal: opts.signal}
  )
  if (!res.ok) throw new Error('http_' + res.status)
  const data = await res.json()
  return data.connections ?? []
}

async function fetchConnections() {
  if (!props.from.trim() || !props.to.trim()) {
    connections.value = []
    error.value = ''
    return
  }

  if (abortController) abortController.abort()
  const controller = new AbortController()
  abortController = controller

  loading.value = true
  error.value = ''
  try {
    connections.value = await fetchPage({
      date: props.date,
      time: props.time,
      isArrival: props.isArrival,
      signal: controller.signal,
    })
    writeCache(currentKey(), connections.value)
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') return
    connections.value = []
    error.value = t('connectionsError')
  } finally {
    if (abortController === controller) {
      loading.value = false
      abortController = null
    }
  }
}

async function loadMore(direction: 'earlier' | 'later') {
  if (loadingMore.value || loading.value || !connections.value.length) return
  loadingMore.value = direction

  // Earlier: query a window starting 60 min before the current earliest dep
  // (and dedupe overlap). Later: 1 min after the current latest dep.
  const refIso = direction === 'earlier'
    ? connections.value[0].from.departure
    : connections.value[connections.value.length - 1].from.departure
  const shifted = new Date(
    new Date(refIso).getTime() + (direction === 'earlier' ? -60 : 1) * 60_000
  )
  const {date, time} = localDateTime(shifted)

  if (abortController) abortController.abort()
  const controller = new AbortController()
  abortController = controller

  try {
    const results = await fetchPage({date, time, isArrival: false, signal: controller.signal})
    const existing = new Set(connections.value.map(c => c.from.departure))
    const fresh = results
      .filter(c => !existing.has(c.from.departure))
      .sort((a, b) => a.from.departure.localeCompare(b.from.departure))
    if (fresh.length) {
      connections.value = direction === 'earlier'
        ? [...fresh, ...connections.value]
        : [...connections.value, ...fresh]
      writeCache(currentKey(), connections.value)
    }
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') return
    // Keep the existing list on failure; don't surface a global error here.
  } finally {
    if (abortController === controller) abortController = null
    loadingMore.value = null
  }
}

watch(
  () => [props.from, props.to, props.date, props.time, props.isArrival, props.paused] as const,
  () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    // While the date picker is open, defer all fetches until it closes.
    if (props.paused) return

    if (props.from.trim() && props.to.trim()) {
      // Cache check: if we have a fresh entry for this exact search, restore
      // it synchronously and skip the network round-trip entirely. This is
      // what makes returning to a Komoot tab feel instant.
      const cached = readFresh<ApiConnection>(currentKey())
      if (cached) {
        if (abortController) abortController.abort()
        abortController = null
        connections.value = cached
        loading.value = false
        error.value = ''
        return
      }
      // Flip loading immediately when a fetch is queued, so the user sees the
      // skeleton during the debounce window instead of a brief "no connections"
      // flash (which would happen when from/to both become truthy but the actual
      // fetch hasn't fired yet).
      loading.value = true
    }
    debounceTimer = setTimeout(fetchConnections, 600)
  },
  {immediate: true}
)

// If the underlying search changes (different hike, new departure, edited
// date/time), the open detail popup no longer reflects current state — close it.
watch(
  () => [props.from, props.to, props.date, props.time, props.isArrival] as const,
  () => {
    selectedConnection.value = null
  }
)

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = null
  if (abortController) abortController.abort()
  abortController = null
})
</script>

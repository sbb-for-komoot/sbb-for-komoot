<template>
  <div class="komoot-route-card komoot-selected-route-card">
    <span v-if="!tourId" class="sidebar_select_route"></span>
    <div v-else-if="loading" class="sidebar_select_route">{{ t('loading') }}</div>
    <div v-else-if="route" class="sidebar_route">
      <a v-if="showMap" class="sidebar_route_map_link" :href="route.share_url" target="_blank" rel="noopener noreferrer">
        <img
          class="sidebar_route_map"
          :src="route.map_image.src.replace('{width}', '400').replace('{height}', '200').replace('{crop}', 'true')"
          alt="Route map"
        />
      </a>
      <div class="sidebar_route_body">
        <a v-if="showTitle" class="sidebar_route_name" :href="route.share_url" target="_blank" rel="noopener noreferrer">
          {{ route.name }}
        </a>
        <div v-if="showBadges" class="sidebar_route_badges">
          <span class="sidebar_route_badge sidebar_route_sport">{{ route.sport }}</span>
          <span class="sidebar_route_badge sidebar_route_difficulty">{{ route.difficulty?.grade }}</span>
        </div>
        <div v-if="showStats" class="sidebar_route_stats">
          <div class="sidebar_route_stat">
            <span class="sidebar_route_stat_label">{{ t('statDistance') }}</span>
            <span class="sidebar_route_stat_value">{{ formatDistance(route.distance) }}</span>
          </div>
          <div class="sidebar_route_stat">
            <span class="sidebar_route_stat_label">{{ t('statDuration') }}</span>
            <span class="sidebar_route_stat_value">{{ formatDuration(route.duration) }}</span>
          </div>
          <div class="sidebar_route_stat">
            <span class="sidebar_route_stat_label">{{ t('statElevationUp') }}</span>
            <span class="sidebar_route_stat_value">{{ Math.round(route.elevation_up) }} m</span>
          </div>
          <div class="sidebar_route_stat">
            <span class="sidebar_route_stat_label">{{ t('statElevationDown') }}</span>
            <span class="sidebar_route_stat_value">{{ Math.round(route.elevation_down) }} m</span>
          </div>
          <div v-if="route.rating_count" class="sidebar_route_stat">
            <span class="sidebar_route_stat_label">{{ t('statRating') }}</span>
            <span class="sidebar_route_stat_value">{{ route.rating_score.toFixed(1) }} ({{ route.rating_count }})</span>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="sidebar_select_route">{{ t('routeNotFound') }}</p>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'

const {t, locale} = useI18n()

const emit = defineEmits<{
  departure: [coords: string | null]
}>()

const props = withDefaults(defineProps<{
  tourId?: string | null
  showMap?: boolean
  showTitle?: boolean
  showBadges?: boolean
  showStats?: boolean
}>(), {
  tourId: null,
  showMap: true,
  showTitle: true,
  showBadges: true,
  showStats: true,
})

interface Route {
  name: string
  sport: string
  distance: number
  duration: number
  elevation_up: number
  elevation_down: number
  difficulty: {grade: string}
  rating_score: number
  rating_count: number
  share_url: string
  map_image: {src: string}
  start_point?: {lat: number; lng: number}
}

const loading = ref(false)
const route = ref<Route | null>(null)

function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

async function fetchRoute(id: string) {
  loading.value = true
  route.value = null
  try {
    const res = await fetch(`https://www.komoot.com/api/v007/discover_tours/${id}?locale=${locale.value}`)
    if (!res.ok) throw new Error('Failed to fetch')
    route.value = await res.json()
    document.title = route.value!.name
    const sp = route.value!.start_point
    emit('departure', sp ? `${sp.lng};${sp.lat}` : null)
  } catch {
    route.value = null
  } finally {
    loading.value = false
  }
}

watch(
  () => props.tourId,
  (id) => {
    if (id) {
      fetchRoute(id)
    } else {
      route.value = null
      document.title = 'SBB for Komoot'
      emit('departure', null)
    }
  },
  {immediate: true}
)
</script>

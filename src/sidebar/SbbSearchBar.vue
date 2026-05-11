<template>
  <div class="sbb-search-wrap">
    <input
      class="sbb-field-value"
      type="text"
      autocomplete="off"
      :placeholder="placeholder"
      :value="modelValue"
      @input="onInput"
      @keydown="onKeydown"
      @blur="onBlur"
    />
    <ul v-if="suggestions.length > 0" class="sbb-suggestions">
      <li
        v-for="(station, i) in suggestions"
        :key="station.id ?? i"
        class="sbb-suggestion-item"
        :class="{ 'sbb-suggestion-item--active': i === activeIndex }"
        @mousedown.prevent="selectStation(station)"
      >
        {{ station.name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

interface Station {
  id: string
  name: string
}

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'select': [station: Station]
}>()

const suggestions = ref<Station[]>([])
const activeIndex = ref(-1)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let blurTimer: ReturnType<typeof setTimeout> | null = null

async function fetchSuggestions(query: string) {
  if (query.length < 2) {
    suggestions.value = []
    return
  }
  try {
    const res = await fetch(
      `https://transport.opendata.ch/v1/locations?query=${encodeURIComponent(query)}&type=station`
    )
    if (!res.ok) return
    const data = await res.json()
    suggestions.value = (data.stations ?? []).filter((s: Station) => s.id && s.name)
  } catch {
    suggestions.value = []
  }
}

function onInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  emit('update:modelValue', value)
  activeIndex.value = -1
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchSuggestions(value), 200)
}

function onKeydown(e: KeyboardEvent) {
  if (!suggestions.value.length) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, suggestions.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  } else if (e.key === 'Enter' && activeIndex.value >= 0) {
    e.preventDefault()
    selectStation(suggestions.value[activeIndex.value])
  } else if (e.key === 'Escape') {
    suggestions.value = []
    activeIndex.value = -1
  }
}

function onBlur() {
  // delay so mousedown on a suggestion fires before the list closes
  if (blurTimer) clearTimeout(blurTimer)
  blurTimer = setTimeout(() => {
    suggestions.value = []
    activeIndex.value = -1
    blurTimer = null
  }, 150)
}

function selectStation(station: Station) {
  emit('update:modelValue', station.name)
  emit('select', station)
  suggestions.value = []
  activeIndex.value = -1
}

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (blurTimer) clearTimeout(blurTimer)
  debounceTimer = null
  blurTimer = null
})
</script>

<style scoped>
.sbb-search-wrap {
  position: relative;
  width: 100%;
}

.sbb-suggestions {
  position: absolute;
  top: 100%;
  left: -2.25rem;
  right: -1rem;
  background: #fff;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  list-style: none;
  margin: 2px 0 0;
  padding: 0.25rem 0;
  z-index: 100;
  max-height: 220px;
  overflow-y: auto;
}

.sbb-suggestion-item {
  padding: 0.45rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sbb-suggestion-item:hover,
.sbb-suggestion-item--active {
  background: #f0f0f0;
}
</style>

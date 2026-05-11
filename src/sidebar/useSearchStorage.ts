import {ref, watch, onMounted} from 'vue'

const STORAGE_KEY = 'sbb_search_state'
const LEGACY_KEY = 'sbb_from'
const TTL_MS = 60 * 60 * 1000 // 1 hour

interface StoredState {
  from: string
  date: string
  time: string
  depArr: 'dep' | 'arr'
  savedAt: number
}

function todayIso(): string {
  return new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
}

function currentTimeRounded(): string {
  // Round to the nearest 5-minute mark via timestamp arithmetic so an
  // hour rollover (e.g. 14:58 → 15:00) carries into the hour field.
  const now = Date.now()
  const fiveMin = 5 * 60_000
  const rounded = new Date(Math.round(now / fiveMin) * fiveMin)
  const h = String(rounded.getHours()).padStart(2, '0')
  const m = String(rounded.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export function useSearchStorage() {
  const from = ref('')
  const date = ref(todayIso())
  const time = ref(currentTimeRounded())
  const depArr = ref<'dep' | 'arr'>('dep')

  // Skip the persist watcher until storage hydration finishes, otherwise the
  // initial default values would overwrite the persisted ones.
  let loaded = false

  onMounted(async () => {
    const result = await chrome.storage.local.get([STORAGE_KEY, LEGACY_KEY]) as {
      sbb_search_state?: StoredState
      sbb_from?: string
    }
    const stored = result.sbb_search_state
    if (stored && Date.now() - stored.savedAt < TTL_MS) {
      from.value = stored.from ?? ''
      date.value = stored.date ?? todayIso()
      time.value = stored.time ?? currentTimeRounded()
      depArr.value = stored.depArr ?? 'dep'
    } else if (result.sbb_from) {
      // Migrate the legacy "sbb_from" key (previously persisted indefinitely).
      from.value = result.sbb_from
    }
    if (result.sbb_from !== undefined) {
      chrome.storage.local.remove(LEGACY_KEY)
    }
    loaded = true
  })

  watch([from, date, time, depArr], () => {
    if (!loaded) return
    const state: StoredState = {
      from: from.value,
      date: date.value,
      time: time.value,
      depArr: depArr.value,
      savedAt: Date.now(),
    }
    chrome.storage.local.set({[STORAGE_KEY]: state})
  })

  return {from, date, time, depArr}
}

<template>
  <Teleport to="body">
    <div v-if="visible" class="dp-backdrop" @click.self="$emit('close')">
      <div class="dp-popup" role="dialog" aria-modal="true" aria-label="Date of travel">

        <!-- Header -->
        <div class="dp-header">
          <h2 class="dp-title">{{ t('dateOfTravel') }}</h2>
          <button class="dp-close-btn" @click="$emit('close')" :aria-label="t('close')">✕</button>
        </div>

        <!-- Controls row: date box | time box | dep/arr -->
        <div class="dp-controls-row">
          <div class="dp-date-box">
            <span class="dp-box-label">{{ t('dateOfTravel') }}</span>
            <span class="dp-box-value">{{ formattedSelectedDate }}</span>
          </div>

          <div class="dp-time-box">
            <div class="dp-time-labels">
              <span>{{ t('hour') }}</span>
              <span>{{ t('minute') }}</span>
            </div>
            <div class="dp-time-body">
              <select class="dp-select" v-model="localHours">
                <option v-for="h in 24" :key="h - 1" :value="h - 1">{{ String(h - 1).padStart(2, '0') }}</option>
              </select>
              <span class="dp-colon">:</span>
              <select class="dp-select" v-model="localMinutes">
                <option v-for="m in minuteOptions" :key="m" :value="m">{{ String(m).padStart(2, '0') }}</option>
              </select>
            </div>
          </div>

          <div class="dp-dep-arr" :class="{ 'dp-dep-arr--arr': localDepArr === 'arr' }">
            <div class="dp-da-slider" aria-hidden="true"></div>
            <button class="dp-da-btn" @click="toggleDepArr()">{{ t('dep') }}</button>
            <button class="dp-da-btn" @click="toggleDepArr()">{{ t('arr') }}</button>
          </div>
        </div>

        <!-- Calendar navigation -->
        <div class="dp-cal-nav">
          <button class="dp-nav-btn" @click="prevMonth" aria-label="Previous month">&#8249;</button>
          <span class="dp-month-label">{{ monthYearLabel }}</span>
          <button class="dp-nav-btn" @click="nextMonth" aria-label="Next month">&#8250;</button>
        </div>

        <!-- Weekday headers -->
        <div class="dp-weekdays">
          <span v-for="(wd, i) in weekdays" :key="i">{{ wd }}</span>
        </div>

        <!-- Days grid -->
        <div class="dp-days-grid">
          <button
            v-for="cell in calendarCells"
            :key="cell.key"
            class="dp-day-cell"
            :class="{
              'dp-day-cell--empty': !cell.day,
              'dp-day-cell--today': cell.isToday && !cell.isSelected,
              'dp-day-cell--selected': cell.isSelected,
            }"
            :disabled="!cell.day"
            @click="cell.day && selectDay(cell.day)"
          >{{ cell.day ?? '' }}</button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue'
import {useI18n} from 'vue-i18n'

const {t, locale} = useI18n()

const props = defineProps<{
  visible: boolean
  date: string      // YYYY-MM-DD
  time: string      // HH:MM
  depArr?: 'dep' | 'arr'
}>()

const emit = defineEmits<{
  close: []
  'update:date': [val: string]
  'update:time': [val: string]
  'update:depArr': [val: 'dep' | 'arr']
}>()

// ── Calendar navigation ────────────────────────────────────
const calYear = ref(0)
const calMonth = ref(0)

watch(
  () => props.date,
  (val) => {
    const d = new Date(val + 'T00:00:00')
    calYear.value = d.getFullYear()
    calMonth.value = d.getMonth()
  },
  {immediate: true},
)

// ── Time ──────────────────────────────────────────────────
const minuteOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

function roundToFive(n: number) { return Math.round(n / 5) * 5 % 60 }

const localHours = ref(parseInt(props.time.split(':')[0]))
const localMinutes = ref(roundToFive(parseInt(props.time.split(':')[1])))

watch(
  () => props.time,
  (val) => {
    localHours.value = parseInt(val.split(':')[0])
    localMinutes.value = roundToFive(parseInt(val.split(':')[1]))
  },
)

watch([localHours, localMinutes], () => {
  const h = String(localHours.value).padStart(2, '0')
  const m = String(localMinutes.value).padStart(2, '0')
  emit('update:time', `${h}:${m}`)
})

// ── dep / arr ──────────────────────────────────────────────
const localDepArr = ref<'dep' | 'arr'>(props.depArr ?? 'dep')
watch(() => props.depArr, (val) => { if (val) localDepArr.value = val })
watch(localDepArr, (val) => emit('update:depArr', val))

function toggleDepArr() {
  localDepArr.value = localDepArr.value === 'dep' ? 'arr' : 'dep'
}

// ── Formatted display ──────────────────────────────────────
const weekdays = computed(() => {
  const monday = new Date(2024, 0, 1) // Jan 1 2024 is a Monday
  return Array.from({length: 7}, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return new Intl.DateTimeFormat(locale.value, {weekday: 'narrow'}).format(d)
  })
})

const formattedSelectedDate = computed(() => {
  const dt = new Date(props.date + 'T00:00:00')
  const weekday = new Intl.DateTimeFormat(locale.value, {weekday: 'short'}).format(dt)
  const dd = String(dt.getDate()).padStart(2, '0')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  return `${weekday}, ${dd}.${mm}.${dt.getFullYear()}`
})

const monthYearLabel = computed(() =>
  new Date(calYear.value, calMonth.value, 1).toLocaleString(locale.value, {
    month: 'long',
    year: 'numeric',
  }),
)

// ── Calendar cells ─────────────────────────────────────────
interface Cell {
  key: string
  day: number | null
  isToday: boolean
  isSelected: boolean
}

const calendarCells = computed((): Cell[] => {
  const year = calYear.value
  const month = calMonth.value
  const firstDow = new Date(year, month, 1).getDay() // 0=Sun
  const offset = (firstDow + 6) % 7                  // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = new Date().toLocaleDateString('en-CA')

  const cells: Cell[] = []
  for (let i = 0; i < offset; i++) {
    cells.push({key: `e${i}`, day: null, isToday: false, isSelected: false})
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    const dateStr = `${year}-${mm}-${dd}`
    cells.push({
      key: dateStr,
      day: d,
      isToday: dateStr === todayStr,
      isSelected: dateStr === props.date,
    })
  }
  return cells
})

// ── Actions ────────────────────────────────────────────────
function selectDay(day: number) {
  const mm = String(calMonth.value + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  emit('update:date', `${calYear.value}-${mm}-${dd}`)
}

function prevMonth() {
  if (calMonth.value === 0) {calMonth.value = 11; calYear.value--}
  else calMonth.value--
}

function nextMonth() {
  if (calMonth.value === 11) {calMonth.value = 0; calYear.value++}
  else calMonth.value++
}
</script>


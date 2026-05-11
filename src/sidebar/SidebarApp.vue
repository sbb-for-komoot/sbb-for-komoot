<template>
  <div class="sidebar_app">
    <div class="sidebar-content">
      <div class="sbb-widget">
      <div class="sbb-card sbb-journey-card">
        <div class="sbb-stop-row">
          <div class="sbb-stop-icon-col">
            <svg class="sbb-stop-dot" viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
              <circle cx="10" cy="10" r="5" fill="var(--sbb-red)" />
            </svg>
            <div class="sbb-stop-line"></div>
          </div>
          <div class="sbb-stop-fields">
            <span class="sbb-field-label">{{ t('from') }}</span>
            <SbbSearchBar 
              v-model="sbbFrom"
              :placeholder="t('fromPlaceholder')"
            />
          </div>
        </div>
        <div class="sbb-stop-row sbb-stop-row--dest">
          <div class="sbb-stop-icon-col">
            <svg class="sbb-stop-dot" viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
              <circle cx="10" cy="10" r="5" fill="none" stroke="#000" stroke-width="2" />
            </svg>
          </div>
          <div class="sbb-stop-fields">
            <span class="sbb-field-label">{{ t('to') }}</span>
            <input
              class="sbb-field-value sbb-field-value--readonly"
              type="text"
              :value="sbbTo ? t('hikeDeparture') : t('selectHike')"
              readonly
              tabindex="-1"
            />
          </div>
        </div>
      </div>

      <div
        class="sbb-card sbb-date-card"
        role="button"
        tabindex="0"
        @click="pickerVisible = true"
        @keydown.enter="pickerVisible = true"
      >
        <span class="sbb-field-label">{{ t('dateOfTravel') }}</span>
        <div class="sbb-date-row">
          <span class="sbb-field-value">{{ formattedDate }}</span>
          <span class="sbb-date-sep">|</span>
          <span class="sbb-field-value">{{ sbbTime }}</span>
          <span class="sbb-dep-label">{{ t(sbbDepArr) }}</span>
        </div>
      </div>
      </div>

      <SbbDatePicker
      :visible="pickerVisible"
      :date="sbbDate"
      :time="sbbTime"
      :dep-arr="sbbDepArr"
      @close="pickerVisible = false"
      @update:date="sbbDate = $event"
      @update:time="sbbTime = $event"
      @update:dep-arr="sbbDepArr = $event"
    />

    <SbbConnectionList
      v-if="isOnKomoot"
      class="conn-list-panel"
      :from="sbbFrom"
      :to="sbbTo"
      :date="sbbDate"
      :time="sbbTime"
      :is-arrival="sbbDepArr === 'arr'"
      :paused="pickerVisible"
    />
    <div v-else class="open-komoot-panel">
      <button class="open-komoot-btn" @click="openKomoot">
        <img src="../images/komoot-white-128x128.webp" class="open-komoot-logo" alt="" />
        {{ t('openKomoot') }}
      </button>
      </div>
    </div> <!-- end sidebar-content -->
    <!-- <KomootRouteCard :tour-id="focusedTourId" :show-badges="false" :show-stats="false" class="sidebar_route_select_card" @departure="sbbTo = $event ?? ''" /> -->

    <div class="sidebar-footer">
      <button class="lang-btn" :aria-label="`Language: ${locale.toUpperCase()}`" @click="langVisible = true">
        <FlagIcon :locale="typedLocale" />
      </button>
      <button class="info-btn" :aria-label="t('aboutExtension')" @click="infoVisible = true">
        <span class="info-btn-letter" aria-hidden="true">i</span>
      </button>
    </div>

    <Transition name="info-fade">
      <div v-if="langVisible" class="info-overlay" role="dialog" aria-modal="true" aria-label="Language" @click.self="langVisible = false">
        <div class="lang-popup">
          <button class="info-popup-close" aria-label="Close" @click="langVisible = false">&times;</button>
          <h2 class="info-popup-title">{{ t('language') }}</h2>
          <div class="lang-flags">
            <button
              v-for="loc in supportedLocales"
              :key="loc"
              class="lang-flag-btn"
              :class="{'lang-flag-btn--active': locale === loc}"
              @click="locale = loc; langVisible = false"
            >
              <FlagIcon :locale="loc" />
              <span class="lang-flag-label">{{ loc.toUpperCase() }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="info-fade">
      <div v-if="infoVisible" class="info-overlay" role="dialog" aria-modal="true" aria-label="About" @click.self="infoVisible = false">
        <div class="info-popup">
          <button class="info-popup-close" :aria-label="t('close')" @click="infoVisible = false">&times;</button>
          <h2 class="info-popup-title">{{ t('infoTitle') }}</h2>
          <p class="info-popup-body" v-html="t('infoBody1')" />
          <p class="info-popup-body">{{ t('infoBody2') }}</p>
          <p class="info-popup-body">
            <svg class="info-popup-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span v-html="t('infoBody3')" />
          </p>
          <p class="info-popup-body">
            <svg class="info-popup-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
            <span v-html="t('infoBody4')" />
          </p>
          <p class="info-popup-footer" v-html="t('infoFooter')" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import SbbDatePicker from './SbbDatePicker.vue'
import SbbConnectionList from './SbbConnectionList.vue'
import {useSearchStorage} from './useSearchStorage'
import {useKomootTab} from './useKomootTab'
import {useLocale} from './useLocale'
import type {SupportedLocale} from '../i18n'
import FlagIcon from './FlagIcon.vue'
import SbbSearchBar from './SbbSearchBar.vue'


const {from: sbbFrom, date: sbbDate, time: sbbTime, depArr: sbbDepArr} = useSearchStorage()
const {isOnKomoot, focusedTourId} = useKomootTab()
const {t, locale} = useI18n()
const {supportedLocales} = useLocale()
const typedLocale = computed<SupportedLocale>(() => locale.value as SupportedLocale)

// Destination is not persisted — it changes every hike
const sbbTo = ref('')

watch(focusedTourId, async (id) => {
  if (!id) {
    sbbTo.value = ''
    return
  }
  try {
    const res = await fetch(`https://www.komoot.com/api/v007/discover_tours/${id}?locale=${locale.value}`)
    if (!res.ok) throw new Error('fetch failed')
    const data = await res.json()
    const sp = data.start_point
    sbbTo.value = sp ? `${sp.lng};${sp.lat}` : ''
  } catch {
    sbbTo.value = ''
  }
})
const pickerVisible = ref(false)
const infoVisible = ref(false)
const langVisible = ref(false)

function openKomoot() {
  chrome.tabs.create({url: 'https://www.komoot.com/discover/start_from_current_location/tours'})
}

const formattedDate = computed(() => {
  if (!sbbDate.value) return ''
  const d = new Date(sbbDate.value + 'T00:00:00')
  const weekday = new Intl.DateTimeFormat(locale.value, {weekday: 'short'}).format(d)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${weekday}, ${dd}.${mm}`
})


</script>

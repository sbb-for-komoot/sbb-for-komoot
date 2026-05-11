<template>
  <svg class="flag-icon" viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <!-- United Kingdom -->
    <template v-if="locale === 'en'">
      <rect width="30" height="20" fill="#012169"/>
      <line x1="0" y1="0" x2="30" y2="20" stroke="white" stroke-width="5.5"/>
      <line x1="30" y1="0" x2="0" y2="20" stroke="white" stroke-width="5.5"/>
      <line x1="0" y1="0" x2="30" y2="20" stroke="#C8102E" stroke-width="2.2"/>
      <line x1="30" y1="0" x2="0" y2="20" stroke="#C8102E" stroke-width="2.2"/>
      <rect x="12" y="0" width="6" height="20" fill="white"/>
      <rect x="0" y="7" width="30" height="6" fill="white"/>
      <rect x="13.5" y="0" width="3" height="20" fill="#C8102E"/>
      <rect x="0" y="8.5" width="30" height="3" fill="#C8102E"/>
    </template>
    <!-- France -->
    <template v-else-if="locale === 'fr'">
      <rect width="10" height="20" fill="#002395"/>
      <rect x="10" width="10" height="20" fill="#ffffff"/>
      <rect x="20" width="10" height="20" fill="#ED2939"/>
    </template>
    <!-- Germany -->
    <template v-else-if="locale === 'de'">
      <rect width="30" height="7" fill="#000000"/>
      <rect y="7" width="30" height="6" fill="#DD0000"/>
      <rect y="13" width="30" height="7" fill="#FFCE00"/>
    </template>
    <!-- Italy -->
    <template v-else-if="locale === 'it'">
      <rect width="10" height="20" fill="#009246"/>
      <rect x="10" width="10" height="20" fill="#ffffff"/>
      <rect x="20" width="10" height="20" fill="#CE2B37"/>
    </template>
  </svg>
</template>

<script setup lang="ts">
import type {SupportedLocale} from '../i18n'
defineProps<{locale: SupportedLocale}>()
</script>

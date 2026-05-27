<script>
import sbbIcon from '../images/sbb-mobile.svg'
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'ContentApp',
  setup() {
    const openSidebar = () => {
        chrome.runtime.sendMessage({type: 'openSidebar'})
    }
    return {openSidebar, sbbIcon}
  }
})
</script>

<template>
  <button
    type="button"
    class="sidebar_handle"
    aria-label="SBB"
    @click="openSidebar"
  >
    <img class="sidebar_handle_logo" :src="sbbIcon" alt="" aria-hidden="true" />
    <span class="sidebar_handle_text">SBB</span>
  </button>
</template>

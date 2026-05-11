import {ref, onMounted, onUnmounted} from 'vue'

const POLL_INTERVAL_MS = 1000

export function useKomootTab() {
  const isOnKomoot = ref(true) // optimistic default to avoid initial flash
  const focusedTourId = ref<string | null>(null)

  function checkTab(url: string | undefined) {
    if (!url) {
      isOnKomoot.value = false
      focusedTourId.value = null
      return
    }
    try {
      const parsed = new URL(url)
      const onKomoot =
        parsed.hostname === 'komoot.com' || parsed.hostname === 'www.komoot.com'
      const isDiscover = parsed.pathname.includes('/discover')
      const isSmartTour = parsed.pathname.includes('/smarttour')
      isOnKomoot.value = onKomoot
      if (onKomoot && isDiscover) {
        focusedTourId.value = parsed.searchParams.get('focusedTour')
      }
      else if (onKomoot && isSmartTour) {
        // get string after smarttour/ in the path, which is the tour id
        focusedTourId.value = parsed.pathname.split('/smarttour/')[1]?.split('/')[0] ?? null
      }
      else {
        focusedTourId.value = null
      }
    } catch {
      isOnKomoot.value = false
      focusedTourId.value = null
    }
  }

  async function queryActiveTab() {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true})
    checkTab(tab?.url)
  }

  function onTabUpdated(
    _tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ) {
    chrome.tabs.query({active: true, currentWindow: true}, ([activeTab]) => {
      if (activeTab?.id === tab.id) checkTab(changeInfo.url ?? tab.url)
    })
  }

  function onTabActivated(_info: chrome.tabs.TabActiveInfo) {
    queryActiveTab()
  }

  let pollInterval: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    queryActiveTab()
    chrome.tabs.onUpdated.addListener(onTabUpdated)
    chrome.tabs.onActivated.addListener(onTabActivated)
    pollInterval = setInterval(queryActiveTab, POLL_INTERVAL_MS)
  })

  onUnmounted(() => {
    chrome.tabs.onUpdated.removeListener(onTabUpdated)
    chrome.tabs.onActivated.removeListener(onTabActivated)
    if (pollInterval !== null) clearInterval(pollInterval)
  })

  return {isOnKomoot, focusedTourId}
}

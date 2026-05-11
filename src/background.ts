console.log(
  '[From the background context] Hello from the background worker/script!'
)

// TODO: migrate sidebar/* and content/* from chrome.* to browser.* so the
// whole codebase uses one promise-based API surface (Extension.js ships a
// polyfill that aliases browser.* on Chromium). Do this after the current
// round of fixes is verified across Chrome/Firefox.

const isFirefoxLike =
  import.meta.env.EXTENSION_PUBLIC_BROWSER === 'firefox' ||
  import.meta.env.EXTENSION_PUBLIC_BROWSER === 'gecko-based'

if (isFirefoxLike) {
  // Action button click IS a user-gesture context, so this works.
  browser.action.onClicked.addListener(() => {
    browser.sidebarAction?.open?.()?.catch(() => {})
  })

  // Messages from content scripts do NOT preserve the user-gesture context in
  // Firefox MV3, so sidebarAction.open() will reject with "may only be called
  // from a user input handler". We attempt it anyway (it's a no-op cost), but
  // swallow the rejection so it doesn't surface as an unhandled promise error.
  // Users have to click the toolbar/sidebar button directly on Firefox.
  browser.runtime.onMessage.addListener((message: any) => {
    if (!message || message.type !== 'openSidebar') return
    browser.sidebarAction?.open?.()?.catch(() => {})
  })
}

if (!isFirefoxLike) {
  // Configure the action button to open the side panel directly. Must be set
  // once at install/startup — not from inside action.onClicked, because with
  // openPanelOnActionClick=true the click opens the panel and the listener
  // never fires again.
  const enableActionOpensPanel = () => {
    chrome.sidePanel
      .setPanelBehavior({openPanelOnActionClick: true})
      .catch((err) => console.error('[background] setPanelBehavior failed', err))
  }
  chrome.runtime.onInstalled.addListener(enableActionOpensPanel)
  chrome.runtime.onStartup.addListener(enableActionOpensPanel)

  // Content-script trigger: open the side panel for the active tab.
  chrome.runtime.onMessage.addListener((message) => {
    if (!message || message.type !== 'openSidebar') return

    if (!chrome.sidePanel.open) return

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const activeTabId = tabs && tabs[0] && tabs[0].id
      if (!activeTabId) return

      try {
        chrome.sidePanel.open({tabId: activeTabId})
      } catch (error) {
        console.error(error)
      }
    })
  })
}

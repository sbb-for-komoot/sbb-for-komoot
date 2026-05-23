/** @type {import('extension').FileConfig} */
// Extension.js uses a fresh profile on every run.
// Prefer that default? Remove the profile config below.
const profile = (name) => `./dist/extension-profile-${name}`

export default {
  browser: {
    chrome: {profile: profile('chrome')},
    chromium: {profile: profile('chromium')},
    edge: {profile: profile('edge')},
    firefox: {profile: profile('firefox')},
    'chromium-based': {profile: profile('chromium-based')},
    'gecko-based': {profile: profile('gecko-based')}
  },
  config: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      vue$: 'vue/dist/vue.runtime.esm-bundler.js',
      'vue-i18n$': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js'
    }
    config.target = ['web', 'es2020']
    config.output = config.output || {}
    config.output.globalObject = 'globalThis'
    config.output.environment = {
      ...(config.output.environment || {}),
      globalThis: true
    }
    return config
  }
}

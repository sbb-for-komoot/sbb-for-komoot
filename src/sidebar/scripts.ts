console.log('[From the sidebar page context] Hello regular page!')
import {createApp} from 'vue'
import SidebarApp from './SidebarApp.vue'
import {i18n} from '../i18n'
import './styles.css'

const app = createApp(SidebarApp)
app.use(i18n)
app.mount('#root')

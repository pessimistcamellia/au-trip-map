import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { Icon, Popup, Search } from 'vant'
import 'vant/es/icon/style'
import 'vant/es/popup/style'
import 'vant/es/search/style'
import App from './App.vue'
import './styles.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: App },
    { path: '/skip', component: App },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

createApp(App)
  .use(createPinia())
  .use(router)
  .use(Icon)
  .use(Popup)
  .use(Search)
  .mount('#app')

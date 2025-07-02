import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './routes.js'


createApp(App)
.use(createPinia())
.use(router)
.mount('#app')

import { createApp } from 'vue'

import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { TinyEmitter } from 'tiny-emitter'

import './style.css'

const pinia = createPinia()
export const emitter = new TinyEmitter()

createApp(App).use(router).use(pinia).mount('#app')

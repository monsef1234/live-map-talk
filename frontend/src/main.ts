import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { TinyEmitter } from 'tiny-emitter'
import router from './router'
import App from './App.vue'
import './style.css'
import { useStore } from './store/store'

export const emitter = new TinyEmitter()
const app = createApp(App)
const pinia = createPinia()

app
  .use(router)
  .use(pinia)
  .mount('#app')

export const store = useStore();

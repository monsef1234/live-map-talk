import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { TinyEmitter } from 'tiny-emitter'
import router from './router'
import App from './App.vue'
import './style.css'

export const emitter = new TinyEmitter()
const app = createApp(App)

app
  .use(router)
  .use(createPinia())
  .mount('#app')

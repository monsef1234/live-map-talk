import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { TinyEmitter } from 'tiny-emitter'
import router from './router'
import App from './App.vue'
import './style.css'

export const emitter = new TinyEmitter()
const pinia = createPinia()
const app = createApp(App)

app.use(router)

app
  .use(pinia) 
  .mount('#app')



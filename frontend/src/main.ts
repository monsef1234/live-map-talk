import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { TinyEmitter } from 'tiny-emitter'
import router from './router'
import App from './App.vue'
import './style.css'

export const emitter = new TinyEmitter()
const app = createApp(App)
const pinia = createPinia()

app.use(pinia).use(router)

router.isReady().then(() => {
  console.log("router is ready");
  app.mount('#app')
})


import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { TinyEmitter } from 'tiny-emitter'
import router from './router'
import App from './App.vue'
import './style.css'

export const emitter = new TinyEmitter()
const app = createApp(App)
const pinia = createPinia()

setActivePinia(pinia)
app.use(router)

router.isReady().then(() => {
  console.log("router is ready");
  app.use(pinia).mount('#app')
})


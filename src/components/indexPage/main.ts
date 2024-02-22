import { createApp } from 'vue'
import { createPinia } from 'pinia'
// 根据地址生成头像
import Jazzicon from 'vue3-jazzicon/src/components'
import App from './App.vue'

const pinia = createPinia()
createApp(App).use(pinia).component('jazzicon', Jazzicon).mount('#bagIndex')
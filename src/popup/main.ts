import { createApp } from 'vue'

import '@/assets/css/conmmon.css';
import App from './App.vue'
// 根据地址生成头像
import Jazzicon from 'vue3-jazzicon/src/components'
import loadingDirective from '../components/loading/directive.js'
const app = createApp(App)
app.directive('loading', loadingDirective)
app.component('jazzicon', Jazzicon);
app.config.globalProperties.Buffer = Buffer;
app.mount('#app');
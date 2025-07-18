import { createApp } from 'vue'

import router from '../router/index.js'
import '@/assets/css/conmmon.css';
import App from './app.vue'
import clickOutside from '../directives/clickOutside.js';
// 根据地址生成头像
import Jazzicon from 'vue3-jazzicon/src/components'
import loadingDirective from '../components/loading/directive.js'
const app = createApp(App)
app.directive('click-outside', clickOutside);
app.use(router)
app.directive('loading', loadingDirective)
app.component('jazzicon', Jazzicon);
app.config.globalProperties.Buffer = Buffer;
app.mount('#app');
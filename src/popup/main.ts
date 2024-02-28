import { createApp } from 'vue'

import '@/assets/css/conmmon.css';
import App from './App.vue'
// 根据地址生成头像
import Jazzicon from 'vue3-jazzicon/src/components'
// import Buffer from 'buffer'
// console.log(Buffer.from('sadasda', 'hex'));
// popup部分组件
import optionsPopup from '../components/popup/options/index.vue'
import loadingDirective from '../components/loading/directive.js'
const app = createApp(App)
app.directive('loading', loadingDirective)
app.component('options-popup', optionsPopup);
app.component('jazzicon', Jazzicon);
app.config.globalProperties.Buffer = Buffer;
app.mount('#app');
import { createApp } from 'vue'

import '@/assets/css/conmmon.css';
import App from './App.vue'
// import Buffer from 'buffer'
// console.log(Buffer.from('sadasda', 'hex'));
// popup部分组件
import optionsPopup from '../components/popup/options/index.vue'
const app = createApp(App)
app.component('options-popup', optionsPopup);
app.config.globalProperties.Buffer = Buffer;
app.mount('#app');
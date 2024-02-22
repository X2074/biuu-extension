import { createApp } from 'vue'

import '@/assets/css/conmmon.css';
import App from './App.vue'
// import Buffer from 'buffer'
// console.log(Buffer.from('sadasda', 'hex'));
const app = createApp(App)
app.config.globalProperties.Buffer = Buffer;
app.mount('#app');
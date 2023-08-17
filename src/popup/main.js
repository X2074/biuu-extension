import { createApp } from 'vue'
import App from './app.vue'
import '@/assets/css/conmmon.css';
import optionsPage from '../components/popup/options/index.vue'

let app = createApp(App);
app.component('options-page', optionsPage);
app.mount('#app')

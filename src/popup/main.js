import { createApp } from 'vue'
import App from './app.vue'
import '@/assets/css/conmmon.css';
// popup部分组件
import optionsPopup from '../components/popup/options/index.vue'
import activityPopup from '../components/popup/components/activity/index.vue'
import detailsPopup from '../components/popup/components/details/index.vue'
import privateKeysPopup from '../components/popup/components/privateKeys/index.vue'
import sitesPopup from '../components/popup/components/sites/index.vue'

let app = createApp(App);
app.component('options-popup', optionsPopup);
app.component('activity-popup', activityPopup);
app.component('details-popup', detailsPopup);
app.component('private-keys-popup', privateKeysPopup);
app.component('sites-popup', sitesPopup);
app.config.globalProperties.$web3 = 'null';
app.mount('#app')

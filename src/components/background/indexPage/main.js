import { createApp } from 'vue'
import index from './index.vue'
// 根据地址生成头像
import Jazzicon from 'vue3-jazzicon/src/components'

let app = createApp(index);

app.component('jazzicon', Jazzicon);
app.mount('#bagIndex')

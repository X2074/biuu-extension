
<template src='./index.html'></template>
<script lang="ts" >
export default {
  name: 'setting'
};
</script>
<style scoped lang='scss'>
@import './index.scss';
</style>
<script lang='ts' setup>
import { ref, onMounted } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus.js';
// import privateKey from './components/privateKey/index.vue'
import security from './security/index.vue';
import addressBook from '../addressBook/index.vue';
let settingStep = ref('options'); //设置页面当前展示内容
let currentWalltAddress = ref(null); //当前钱包信息

let loading = ref(false);
let loadingText = ref('加载中...');
indexDbData.getData('currentWalltAddress').then((res: any) => {
  currentWalltAddress.value = res;
});
// 返回上一页面
const toBack = (page: string) => {
  if (page == 'homePage') {
    bus.emit('nextPage', '');
  } else {
    settingStep.value = page;
  }
};

bus.on('settingPage', (res: any) => {
  settingStep.value = res;
});
</script>
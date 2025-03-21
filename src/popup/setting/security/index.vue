<template src='./index.html'></template>
<script lang="ts" >
export default {
  name: 'security'
};
</script>
<script lang='ts' setup>
import { ref, onMounted } from 'vue';
import bus from '@/utils/bus.js';
import indexDbData from '@/utils/indexDB.js';
import privateKey from './components/privateKey/index.vue';
import mnemonicPhrase from './components/mnemonicPhrase/index.vue';
import revisePassword from './components/revisePassword/index.vue';

import md5 from 'js-md5';
let loading = ref(true);
let passKey = ref(''); //密码
let securityProcess = ref(''); //显示那个按钮内容
let currentWalltAddress = ref(null); //当前钱包信息
onMounted(() => {
  indexDbData.getData('currentWalltAddress').then((res: any) => {
    currentWalltAddress.value = res;
  });
  initializeInfo();
});
// 数据初始化
const initializeInfo = () => {
  // 获取设置的密码
  indexDbData
    .getData(md5('secret'))
    .then((res: any) => {
      passKey.value = res.secret;
    })
    .catch(() => {});
  loading.value = false;
};
// 取消，回到设置页面
const toBack = () => {
  bus.emit('settingPage', 'options');
};
bus.on('securityPage', () => {
  securityProcess.value = '';
});
</script>
<style lang="scss">
@import './index.scss';
</style>
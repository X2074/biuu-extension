
<template src='./index.html'></template>
<script lang="ts" >
export default {
  name: 'networkSwitching'
};
</script>
<style scoped lang='scss'>
@import './index.scss';
</style>
<script lang='ts' setup>
import { ref, onMounted, toRaw } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus.js';
let settingStep = ref('options'); //设置页面当前展示内容
let loading = ref(true);
let loadingText = ref('加载中...');
let networkModel = ref({
  evm: null,
  utxo: null
});
onMounted(async () => {
  networkModel.value['evm'] = await indexDbData.getData('EVM');
  networkModel.value['utxo'] = await indexDbData.getData('UTXO');
  console.log(networkModel.value, 'networkModel');

  loading.value = false;
});
// 选中的网络
const rpcChange = async (event: any, type: string) => {
  console.log(event, 'event');
  loading.value = true;
  let dataRpc = toRaw(event);
  console.log(dataRpc, 'dataRpc');
  dataRpc['netWorkType'] = type;
  // 存储选中的网络数据
  indexDbData.putData(
    Object.assign(
      {
        id: 'rpc_url'
      },
      dataRpc
    )
  );
  // 当前用户信息
  let currentWalltAddress = dataRpc['walltInfo'][0];
  currentWalltAddress['id'] = 'currentWalltAddress';
  currentWalltAddress['netWorkType'] = type;
  indexDbData.putData(currentWalltAddress);
  loading.value = false;
  setTimeout(() => {
    bus.emit('nextPage', 'homePage');
  }, 300);
};
// 返回上一页面
const toBack = (page: string) => {
  bus.emit('nextPage', '');
};
</script>
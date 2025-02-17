<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, toRaw } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus.js';
const networkWallt: any = ref(null); //网络下面存的钱包数据
onMounted(() => {
  indexDbData.getData('rpc_url').then((res: any) => {
    networkWallt.value = res;
  });
});
// 新增网络
let networkName = ref('');
let RpcUrl = ref('');
let tokenId = ref('');
let symbol = ref('');
let Blockchain = ref('');
// 新增evm网络
const addNetWork = () => {
  if (!networkName.value) {
    bus.emit('promptModalErr', '请输入网络名称');
    return;
  }
  const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  if (!RpcUrl.value) {
    bus.emit('promptModalErr', '请输入RPC URL地址');
    return;
  }
  if (!urlRegex.test(RpcUrl.value)) {
    bus.emit('promptModalErr', 'RPC URL地址格式有误');
    return;
  }
  const numberRegex = /^\d+$/;
  if (!tokenId.value) {
    bus.emit('promptModalErr', '请输入链ID');
    return;
  }
  if (!numberRegex.test(tokenId.value)) {
    bus.emit('promptModalErr', '链ID格式有误');
    return;
  }
  if (!symbol.value) {
    bus.emit('promptModalErr', '请输入货币符号');
    return;
  }
  indexDbData.getData('EVM').then((res: any) => {
    let names;
    for (const key in res.content) {
      if (res.content[key]['netName'] == networkName.value) {
        names = networkName.value;
      }
    }
    if (names) {
      bus.emit('promptModalErr', '网络名称重复，请重新输入');
      return;
    }
    networkWallt.value['CHAIN_ID'] = tokenId.value;
    networkWallt.value['netName'] = networkName.value;
    networkWallt.value['unit'] = symbol.value;
    networkWallt.value['url'] = RpcUrl.value;
    networkWallt.value['blockchain'] = Blockchain.value;
    delete networkWallt.value['id'];
    delete networkWallt.value['netWorkType'];
    delete networkWallt.value['type'];
    res.content[tokenId.value] = toRaw(networkWallt.value);
    console.log(toRaw(res), 'resresresresres');

    indexDbData.putData(toRaw(res));
    bus.emit('promptModalSuccess', '网络添加成功');
    setTimeout(() => {
      toBack();
    }, 500);
  });
};
// 返回上一页面
const toBack = () => {
  bus.emit('nextPage', '');
};
</script>
<style lang='scss'>
@import './index.scss';
</style>
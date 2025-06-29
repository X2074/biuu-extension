<template src="./index.html"></template>
<script lang="ts">
export default {
    name: 'networkSwitching'
};
</script>
<style scoped lang="scss">
@import './index.scss';
</style>
<script lang="ts" setup>
import { ref, onMounted, toRaw } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import { chainChanged } from '@/utils/dappOnChange';
import bus from '@/utils/bus.js'; // 预制网络
import { netWork } from '@/utils/defaultNetwork.js';
let settingStep = ref('options'); //设置页面当前展示内容
let loading = ref(true);
let loadingText = ref('加载中...');
let networkModel = ref({
    evm: null,
    utxo: null
});
const currentType = ref({});
onMounted(async () => {
    let evmInfo = await indexDbData.getData('EVM');
    let utxoInfo = await indexDbData.getData('UTXO');
    let walltInfo = await indexDbData.getData('currentWalltAddress');
    console.log(networkModel.value, 'networkModel');
    if (JSON.stringify(evmInfo.content) === '{}') {
        evmInfo['content'] = netWork.EVM;
        evmInfo['keyStore'] = walltInfo.keyStore;
        evmInfo['NoIndex'] = walltInfo.NoIndex;
        indexDbData.putData(evmInfo);
    }
    if (JSON.stringify(utxoInfo.content) === '{}') {
        utxoInfo['content'] = netWork.UTXO;
        utxoInfo['keyStore'] = walltInfo.keyStore;
        utxoInfo['NoIndex'] = walltInfo.NoIndex;
        indexDbData.putData(utxoInfo);
    }
    networkModel.value['evm'] = evmInfo;
    networkModel.value['utxo'] = utxoInfo;
    loading.value = false;

    currentType.value = await indexDbData.getData('rpc_url');
    console.log(currentType.value, 'vv');
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
    chainChanged(event.CHAIN_ID);
    setTimeout(() => {
        bus.emit('nextPage', 'homePage');
    }, 300);
};
// 返回上一页面
const toBack = () => {
    bus.emit('nextPage', '');
};
</script>

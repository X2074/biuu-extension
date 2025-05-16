<style lang="scss" scoped>
@import './index.scss';
</style>
<template src="./index.html"></template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, toRaw } from 'vue';
import indexDbData from '@/utils/indexDB';
import { chainChanged } from '@/utils/dappOnChange';
import { Decrypt, getGas, evmKey, utxoKey, getBlance } from '@/utils/index';
import md5 from 'js-md5';
import { ethers } from 'ethers';
const message = ref('');
const address = ref('');
const origin = ref('');
let passKey = ref('');
let privateKey: any = ref(null);
let newNetwork: any = ref({});
onMounted(async () => {
    newNetwork.value = await indexDbData.getData('newNetwork');
})

const reject = () => {
    let data: any = { action: 'add_ethereumChain', error: 'User rejected the request' };
    chrome.runtime.sendMessage(data, (response: any) => {
        console.log(response, 'response');
        window.close();
    });
};
const addEth = async () => {
    indexDbData.getData('EVM').then((res: any) => {
        let ethereumChain:any = {};
        ethereumChain['CHAIN_ID'] = newNetwork.value['chainId'];
        ethereumChain['netName'] = newNetwork.value['chainName'];
        ethereumChain['unit'] = newNetwork.value['nativeCurrency']['symbol'];
        ethereumChain['url'] = newNetwork.value['rpcUrls'][0];
        ethereumChain['rpcUrls'] = newNetwork.value['rpcUrls'];
        ethereumChain['iconUrls'] = newNetwork.value['iconUrls'];
        ethereumChain['blockExplorerUrls'] = newNetwork.value['blockExplorerUrls'];
        ethereumChain['nativeCurrency'] = newNetwork.value['nativeCurrency'];
        // 获取当前钱包账号信息
        const walltInfo = Object.keys(res['content'])[0];
        ethereumChain['walltInfo'] = walltInfo;
        res.content[newNetwork.value['chainId']] = ethereumChain;
        console.log(res, 'resresresresres');
        // 发送添加结果
        chrome.runtime.sendMessage({
            action: 'add_ethereumChain',
            ethereumChain: ethereumChain,
            result: true
        });
        chainChanged(newNetwork.value['chainId'])

        indexDbData.putData(toRaw(res));
        window.close();
    });
};
</script>

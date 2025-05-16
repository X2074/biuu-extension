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
        let chainEVM:any = await indexDbData.getData('EVM')
//    .then((res: any) => {
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
        // const walltInfo = Object.keys(res['content'])[0];
        let walltInfo;
        for (const key in chainEVM['content']) {
            if (chainEVM['content'].hasOwnProperty(key)) {
                walltInfo = chainEVM['content'][key]['walltInfo'];
                break;
            }
        }
        ethereumChain['walltInfo'] = walltInfo;
        chainEVM.content[newNetwork.value['chainId']] = ethereumChain;
        console.log(chainEVM, 'resresresresres');
        chainEVM = JSON.parse(JSON.stringify(chainEVM));
        indexDbData.putData(chainEVM);
        indexDbData.deleteData('newNetwork')
        // 发送添加结果
        chrome.runtime.sendMessage({
            action: 'add_ethereumChain',
            ethereumChain: ethereumChain,
            result: true
        });

        chainChanged(newNetwork.value['chainId'])
        window.close();
    // });
};
</script>

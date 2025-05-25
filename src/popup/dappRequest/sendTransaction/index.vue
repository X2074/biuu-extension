<style lang="scss" scoped>
@import './index.scss';
</style>
<template src="./index.html"></template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, toRaw } from 'vue';
import indexDbData from '@/utils/indexDB';
import { Decrypt, getGas, evmKey, utxoKey, getBalance } from '@/utils/index';
import md5 from 'js-md5';
import { ethers } from 'ethers';
import { sendTraction } from '@/utils/UTXO/meerRpc';
import Web3 from 'web3';

// 初始化 web3
const web3 = new Web3();
let gasPrice:any = ref(0)
let passKey:any = ref(null)
let authorization:any = ref(null)
let currentWallt:any = ref(null)
let rpc_url:any = ref(null)
let sendTransaction:any = ref(null)
let toAddress = ref<string>('')
let privateKey:any = ref(null)
let balanceSecre:any = ref(null)
onMounted(async () => {
    try {
        let sendTransactionData = await chrome.storage.local.get('sendTransaction');
        sendTransaction.value = sendTransactionData['sendTransaction']
        console.log(sendTransaction.value,"sendTransaction.value");
        toAddress.value = sendTransaction.value.to.substr(0, 6) +'...'+ sendTransaction.value.to.substr(-4);
        gasPrice.value = await getGasFee();
        console.log(gasPrice.value,"gasPrice.value");
        // 获取钱包余额
        let rpcUrlData = await indexDbData.getData('rpc_url');
        authorization.value = await indexDbData.getData('authorization');
        rpc_url.value = await indexDbData.getData('rpc_url');
        // 从 IndexedDB 获取私钥
        currentWallt.value = await indexDbData.getData('currentWalltAddress');
        console.log(currentWallt.value,"currentWallt.value");
       let secret = await indexDbData.getData(md5('secret'))
       passKey.value = secret['secret']
        // 钱包地址
        balanceSecre.value = await getBalance(
            rpcUrlData.url,
            Object.assign({ netWorkType: rpcUrlData.netWorkType }, currentWallt.value)
        );
        
    } catch (error) {
        console.log(error,'error');
        
        // let data: any = { action: 'personal_sign', error: 'The requested account and/or method has not been authorized by the user.' };
        // chrome.runtime.sendMessage(data, (response: any) => {
        //     console.log(response, 'response');
        //     window.close();
        // });
    }
    
});
const getGasFee = async () => { 
    // 使用BigInt处理大数
   // 使用 web3.utils.fromWei 将 wei 转换为 ETH
   const gasFee = web3.utils.fromWei(
            web3.utils.toBN(sendTransaction.value.gasPrice)
                .mul(web3.utils.toBN(sendTransaction.value.gas))
                .toString()
        );

        console.log(gasFee, "gasFee");
        return parseFloat(gasFee).toFixed(4);
  }
const reject = () => {
    let data: any = { action: 'personal_sign', error: 'User rejected the request' };
    chrome.runtime.sendMessage(data, (response: any) => {
        console.log(response, 'response');
        window.close();
    });
};
const sign = async () => {
    // 发送签名结果
    // chrome.runtime.sendMessage({
    //     action: 'eth_sendTransaction',
    //     signature:'confirm'
    // });
    
    try {
        // 从 IndexedDB 获取私钥
        let currentWallt = await indexDbData.getData('currentWalltAddress');
        console.log(currentWallt, 'currentWallt');
        let data = await indexDbData.getData('keyStore');
        console.log(data, 'data');
        let key = toRaw(data.secret[currentWallt['keyStore']]);
        console.log(key, 'key');
        // 如果账户是私钥导入的，就直接赋值私钥
        // 907fd84538e3ac1caebdbbd35b00cad93986ee9ae34785e99e62843020c98f72
        let encryption = await Decrypt(key, passKey.value);
        console.log(encryption, 'encryption');
        if (currentWallt['keyStoreType'] && currentWallt['keyStoreType'] == 'privateKey') {
            privateKey.value = { privateKey: encryption };
        } else {
            privateKey.value = await evmKey(encryption);
        }
        console.log(privateKey.value['privateKey'], 'privateKey.value');

        // 使用 web3.js 或 ethers.js 进行签名
        // 这里使用 ethers.js 作为示例;
        // 0x14b75d96a426ff726a8b69f2372eefc5922f4400f98acbb16e0e01fa7b726e1e6bcb8acf1e2addd9386c62983786e7e8d4a4147149d7b1e03a2d82f99d446b551c
        // 发送签名结果
        chrome.runtime.sendMessage({
            action: 'eth_sendTransaction',
            privateKey:privateKey.value['privateKey'],
            balance:balanceSecre.value
        });
        // window.close();
    } catch (error: any) {
        console.error('Sign error:', error);
        chrome.runtime.sendMessage({
            action: 'personal_sign',
            error: error.message
        });
        // window.close();
    }
};
</script>

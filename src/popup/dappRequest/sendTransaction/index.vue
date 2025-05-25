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
const message = ref('');
const address = ref('');
const origin = ref('');
let passKey = ref('');
let privateKey: any = ref(null);
let authorization: any = ref({});
let currentWallt:any = ref(null)
let rpc_url:any = ref(null)
onMounted(async () => {
    authorization.value = await indexDbData.getData('authorization');
    rpc_url.value = await indexDbData.getData('rpc_url');
    // 从 IndexedDB 获取私钥
    currentWallt.value = await indexDbData.getData('currentWalltAddress');
    indexDbData
        .getData(md5('secret'))
        .then((res: any) => {
            passKey.value = res.secret;
        })
        .catch((err: any) => {
            console.log(err);
        });
    
});

const reject = () => {
    let data: any = { action: 'personal_sign', error: 'User rejected the request' };
    chrome.runtime.sendMessage(data, (response: any) => {
        console.log(response, 'response');
        window.close();
    });
};
const sign = async () => {
    try {
        let data = await indexDbData.getData('keyStore');
        let key = toRaw(data.secret[currentWallt.value['keyStore']]);
        // 如果账户是私钥导入的，就直接赋值私钥
        // 907fd84538e3ac1caebdbbd35b00cad93986ee9ae34785e99e62843020c98f72
        let encryption = await Decrypt(key, passKey.value);
        console.log(encryption, 'encryption');
        if (currentWallt.value['keyStoreType'] && currentWallt.value['keyStoreType'] == 'privateKey') {
            privateKey.value = { privateKey: encryption };
        } else {
            privateKey.value = await evmKey(encryption);
        }
        console.log(privateKey.value['privateKey'], 'privateKey.value');

            // if (message.action === 'eth_sendTransaction') {
                //     chrome.runtime.onMessage.removeListener(handleMessage);

                //     if (message.signature) {
                //         // 使用私钥签名交易
                //         const signedTx = web3.eth.accounts.signTransaction(txParams, currentWallt.privateKey);
                //         signedTx.then((signed: any) => {
                //             // 发送签名后的交易
                //             web3.eth.sendSignedTransaction(signed.rawTransaction)
                //                 .on('transactionHash', (hash: string) => {
                //                     resolve(hash);
                //                 })
                //                 .on('error', (error: any) => {
                //                     reject(error);
                //                 });
                //         });
                //     } else {
                //         reject(new Error('User rejected the transaction'));
                //     }
                // }


        
        // 使用 web3.js 或 ethers.js 进行签名
        // 这里使用 ethers.js 作为示例
        const wallet = new ethers.Wallet(privateKey.value['privateKey']);
        const signature = await wallet.signMessage(message.value);
        // 0x14b75d96a426ff726a8b69f2372eefc5922f4400f98acbb16e0e01fa7b726e1e6bcb8acf1e2addd9386c62983786e7e8d4a4147149d7b1e03a2d82f99d446b551c
        console.log(signature, 'signature');
        // 发送签名结果
        chrome.runtime.sendMessage({
            action: 'personal_sign',
            signature
        });
        window.close();
    } catch (error: any) {
        console.error('Sign error:', error);
        chrome.runtime.sendMessage({
            action: 'personal_sign',
            error: error.message
        });
        window.close();
    }
};
</script>

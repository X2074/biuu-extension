<template src='./index.html'></template>
<script lang='ts' setup>

import { ref, onMounted, watchEffect, getCurrentInstance } from 'vue';
import indexDbData from '../../../../utils/indexDB.js';
import bus from '../../../../utils/bus.js';
import { Encrypt, Decrypt } from '../../../../utils/index.js';
import md5 from 'js-md5';
// 预制网络
import netWork from '../../../../utils/netWork.json'
const CryptoJS = require('crypto-js'); //引用AES源码js
let mnemonicList = ref([])//助记词数组
let newPsd = ref('')//钱包密码
let confirmPsd = ref('')//钱包密码
let newPsdBol = ref(false)
let confirmPsdBol = ref(false)
let useCheck = ref('n')//是否阅读条款
let walltInfo = ref(null)//钱包相关信息
let loading = ref(true)
let verifyBol = ref(false)

onMounted(() => {
    bus.on('mnemonicContent', (res) => {
        console.log(res, '第二部验证');
        walltInfo.value = res;
    })
    // 存储evm、utxo
    indexDbData.putData({
        id: 'EVM',
        content: {},
        keyStore: null
    })
    indexDbData.putData({
        id: 'UTXO',
        content: {},
        keyStore: null
    })
    apendContent()
})

// 生成keystory文件
const creatKeyStory = () => {
    newPsdBol.value = false;
    confirmPsdBol.value = false;
    if (!verifyBol.value) return;
    if (!newPsd.value || newPsd.value.length < 8) {
        newPsdBol.value = true;
        confirmPsd.value = '';
        return;
    }
    if (!confirmPsd.value) {
        confirmPsdBol.value = true;
        return;
    }
    if (newPsd.value != confirmPsd.value) {
        confirmPsdBol.value = true;
        return;
    }
    UtxoEvmKey()
    // setTimeout(() => {
    //     $emit('nextPage', 'userContent');
    // }, 500)
}
// 助记词加密
const UtxoEvmKey = () => {
    let ciphertext = Encrypt(walltInfo.value.mnemonic, newPsd.value);
    console.log(ciphertext, '加密后的数据');
    indexDbData.putData({
        id: 'keyStore',
        secret: ciphertext
    })
    evmNetwork();//新增并存储evm网络
    utxoNetwork();//新增并存储evm网络
}
const evmNetwork = () => {
    indexDbData.getData('EVM').then(res => {
        // 提取数据库存储的网络 chainid
        let chainId = Object.keys(res.content)
        Object.keys(netWork.EVM).forEach(item => {
            if (!chainId.includes(item)) { //如果数据库没有这个网络
                res.content[item] = netWork.EVM[item];
            }
        })
        Object.keys(res.content).forEach((item, index) => {
            console.log(res.content[item].walltInfo, 'res.content[item].walltInfo');

            res.content[item].walltInfo.push({
                address: walltInfo.value.address, //当前用户地址
                userName: '',
                userUrl: '',
                NoIndex: index + 1//当前第几个用户
            })
        })
        console.log(res, 1111111);
        indexDbData.putData(res)
    })
    // 存储密码
    indexDbData.putData({
        id: md5('secret'),
        secret: md5(newPsd.value)
    })
}
const utxoNetwork = () => {
    indexDbData.getData('UTXO').then(res => {
        // if (!res.content('8131')) {
        //     // 新增默认utxo网络
        //     res.content = {
        //         8131: {
        //             id: 'rpc_url',
        //             unit: 'MEER',
        //             CHAIN_ID: 8131,
        //             url: 'https://testnet-qng.rpc.qitmeer.io',
        //             walltInfo: []
        //         }
        //     }
        // }
        // 提取数据库存储的网络 chainid
        let chainId = Object.keys(res.content)
        Object.keys(netWork.UTXO).forEach(item => {
            if (!chainId.includes(item)) { //如果数据库没有这个网络
                res.content[item] = netWork.UTXO[item];
            }
        })
        Object.keys(res.content).forEach((item, index) => {
            res.content[item].walltInfo.push({
                address: walltInfo.value.utxoAddressTest, //当前用户地址
                userName: '',
                userUrl: '',
                NoIndex: index + 1//当前第几个用户
            })
        })
        indexDbData.putData(res)
    })
    // 存储密码
    indexDbData.putData({
        id: md5('secret'),
        secret: md5(newPsd.value)
    })
}
// 监听粘贴事件
const pasteFun = (e) => {
    verifyBol.value = true;
    let clipboardData = e.clipboardData.getData('Text');//获取粘贴内容
    clipboardData = clipboardData.replace(/\r\n\r/g, ' ')
    clipboardData = clipboardData.split(' ');
    clipboardData.forEach((item, index) => {
        console.log(walltInfo.value.mnemonicArray[index].length, item.length, walltInfo.value.mnemonicArray[index] == item.replace(/\s*/g, ''));
        let data = {
            id: index + 1,
            mnemonic: item.replace(/\s*/g, ''),
            yn: 'y',
            class: walltInfo.value.mnemonicArray[index] == item.replace(/\s*/g, '') ? '' : 'un'
        }
        if (walltInfo.value.mnemonicArray[index] != item.replace(/\s*/g, '')) verifyBol.value = false;
        mnemonicList.value[index] = data;
    });
}
// 添加助记词显示
const apendContent = () => {
    for (let i = 0; i <= 11; ++i) {
        let data = {
            id: i + 1,
            mnemonic: '',
            yn: 'y'
        }
        mnemonicList.value.push(data)
    }
}
const onPage = () => {
    bus.emit('nextPage', 'createMnemonic')
}
</script>
<style lang='scss'>
@import './index.scss';
</style>
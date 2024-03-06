<template src='./index.html'></template>
<script lang='ts' setup>

import { ref, onMounted, watchEffect, getCurrentInstance } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus.js';
import { v4 as uuidv4 } from 'uuid';
import { Encrypt } from '@/utils/index.js';
import md5 from 'js-md5';
import bip39 from 'bip39'
import {createMnemonic,createWallet} from "@/utils/createUser"
// 预制网络
import netWork from '@/utils/netWork.json'
import CryptoJS from 'crypto-js'; //引用AES源码js
let mnemonicList = ref([]);//助记词数组
let newPsd = ref('');//钱包密码
let confirmPsd = ref('');//钱包密码
let newPsdBol = ref(false);
let confirmPsdBol = ref(false);
let mnemonicPhrase = ref(null);
let mnemonicPhraseErr = ref('')
let passKey = ref('');//密码
// 获取设置的密码
indexDbData.getData(md5('secret')).then(res => {
    passKey.value = res.secret;
}).catch(err => { })
// 确认
const mnemonicPhraseConfirm = async ()=>{
    mnemonicPhraseErr.value = '';
    if(!mnemonicPhrase.value){  
        mnemonicPhraseErr.value = '请输入助记词';
        return;
    }
    var regex = /^[a-zA-Z0-9\s]*$/; // 只允许输入数字和字母
    if (!regex.test(mnemonicPhrase.value)) {
        mnemonicPhraseErr.value = '无效的输入，请再试一次。';
        return;
    }
    if(!bip39.validateMnemonic(mnemonicPhrase.value)) {
        mnemonicPhraseErr.value = '无效的输入，请再试一次。';
        return;
    }
    let data = mnemonicPhrase.value.split(' ');
    console.log(data,'data');
    
    if (data.length && data.length != 12 && data.length != 18 && data.length != 24) {
        mnemonicPhraseErr.value = '无效的输入，请再试一次。02';
        return;
    }
    // 助记词生成的数据
    let createData = await createWallet(mnemonicPhrase.value);
    saveKey(createData['keystore'])
    
    let currentWalltAddress = await indexDbData.getData('currentWalltAddress');
    // 保存current和rpc的数据整合
    let content = {
        id: 'currentWalltAddress',
        address: createData['address'],
        userName: 'Wallt' + (!currentWalltAddress.NoIndex ? '01' : (currentWalltAddress.NoIndex + 1 > 10 ? currentWalltAddress.NoIndex + 1 : '0' + (currentWalltAddress.NoIndex + 1))),
        userUrl: '',
        keystore:createData['keystore'],
        NoIndex: currentWalltAddress.NoIndex ? (currentWalltAddress.NoIndex + 1) : 1//当前第几个用户
    }
    // 存为当前选中的网络中数据
    let rpc_url = await indexDbData.getData('rpc_url')
    rpc_url.walltInfo.push(content)
    // 保存rpc_url
    indexDbData.putData(rpc_url)
    evmNetwork(createData);//新增并存储evm网络
    utxoNetwork(createData);//新增并存储evm网络
    bus.emit('promptModalSuccess','导入成功')
}

// 保存key
const saveKey = async (keyName)=>{
    // 私钥加密
    let ciphertext = await Encrypt(mnemonicPhrase.value, passKey.value);
    // 保存加密数据
    let getKeyStore = await indexDbData.getData('keyStore')
    console.log(getKeyStore.secret,'老的key');
    let info:any = {};
    info[keyName] = ciphertext;
    console.log(info,'新的key');
    // 合并后的key
    let keyData:any = {};
    keyData = Object.assign(getKeyStore.secret,info);
    // 保存key
    indexDbData.putData({
        id: 'keyStore',
        secret: keyData
    })
}
const evmNetwork = (walltInfo) => {
    indexDbData.getData('EVM').then(res => {
        // 提取数据库存储的网络 chainid
        if (!res || !res.content) {
            res.content['8031'] = netWork.EVM['8031'];
            res.content['97'] = netWork.EVM['97'];
            indexDbData.putData({
                id: 'rpc_url',
                unit: 'BNB',
                CHAIN_ID: 97,
                type: 'EVM',
                url: 'https://data-seed-prebsc-1-s2.binance.org:8545/'
            })
        }
        let chainId = Object.keys(res.content)
        Object.keys(netWork.EVM).forEach(item => {
            if (!chainId.includes(item)) { //如果数据库没有这个网络
                res.content[item] = netWork.EVM[item];
            }
        })
        Object.keys(res.content).forEach((item, index) => {
            res.content[item].walltInfo.push({
                utxoAddressTest: walltInfo.utxoAddressTest, //当前用户测试地址
                address: walltInfo.utxoAddressMain, //当前用户地址
                userName: 'Wallt' + (!index ? '01' : (index + 1 > 10 ? index + 1 : '0' + (index + 1))),
        keystore:createData['keystore'],
                userUrl: '',
                NoIndex: index + 1//当前第几个用户
            })
        })
        console.log(res, 1111111);
        indexDbData.putData(res)
    })
}
const utxoNetwork = (walltInfo) => {
    indexDbData.getData('UTXO').then(res => {
        if (!res || !res.content) {
            // 新增默认utxo网络
            res.content = {
                8131: {
                    id: 'rpc_url',
                    unit: 'MEER',
                    CHAIN_ID: 8131,
                    url: 'https://testnet-qng.rpc.qitmeer.io',
                    walltInfo: []
                }
            }
        }
        // 提取数据库存储的网络 chainid
        let chainId = Object.keys(res.content)
        Object.keys(netWork.UTXO).forEach(item => {
            if (!chainId.includes(item)) { //如果数据库没有这个网络
                res.content[item] = netWork.UTXO[item];
            }
        })
        Object.keys(res.content).forEach((item, index) => {
            res.content[item].walltInfo.push({
                address: walltInfo.utxoAddressTest, //当前用户地址
                userName: 'Wallt' + (!index ? '01' : (index + 1 > 10 ? index + 1 : '0' + (index + 1))),
        keystore:createData['keystore'],
                userUrl: '',
                NoIndex: index + 1//当前第几个用户
            })
        })
        indexDbData.putData(res)
    })
}
</script>
<style lang='scss'>
@import '../privatePhrase.scss';
</style>
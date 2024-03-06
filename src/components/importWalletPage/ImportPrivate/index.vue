<template src='./index.html'></template>
<script lang='ts' setup>

import { ref, onMounted, watchEffect, getCurrentInstance } from 'vue';
import bitcoin from 'bitcoinjs-lib';
import qitmeer from 'qitmeer-js'
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus.js';
import { v4 as uuidv4 } from 'uuid';
import Web3 from 'web3'
import { Encrypt } from '@/utils/index.js';
import md5 from 'js-md5';
// 预制网络
import netWork from '@/utils/netWork.json'
import CryptoJS from 'crypto-js'; //引用AES源码js
let mnemonicList = ref([]);//助记词数组
let moduleType = ref('evm');//选中的模块
let newPsd = ref('');//钱包密码
let confirmPsd = ref('');//钱包密码
let newPsdBol = ref(false);
let confirmPsdBol = ref(false);
let privatePhrase = ref(null);
let privatePhraseErr = ref('');
let passKey = ref('');//密码
// 获取设置的密码
indexDbData.getData(md5('secret')).then(res => {
    passKey.value = res.secret;
}).catch(err => { })
// 确认
const privatePrivateConfirm = async ()=>{
    privatePhraseErr.value = '';
    if(!privatePhrase.value){  
        privatePhraseErr.value = '请输入私钥';
        return;
    }
    var regex = /^[a-zA-Z0-9]*$/; // 只允许输入数字和字母
    if (!regex.test(privatePhrase.value)) {
        privatePhraseErr.value = '无效的输入，请再试一次。';
        return;
    }
    let keyName = uuidv4();
    
    // 创建evm
    if(moduleType.value == 'evm'){
        isValidPrivateKey(keyName)
    }else{
        generateUTXOWallet(keyName)
    }
    
}
// evm私钥生成钱包
const isValidPrivateKey = async (keyName)=>{
    try {
        const web3 = new Web3();
        const account = web3.eth.accounts.privateKeyToAccount(privatePhrase.value);
        console.log(account,'account');
        
        if (account && account.address) {
            evmNetwork(account)
            saveKey(keyName)
            bus.emit('promptModalSuccess','EVM导入成功')
            return true;
        } else {
            privatePhraseErr.value = '无效的输入，请再试一次。';
            return false;
        }
    } catch (error) {
            privatePhraseErr.value = '无效的输入，请再试一次。';
            return false;
    }
}
// 通过私钥生成 UTXO 钱包
const generateUTXOWallet =async (privateKey)=>{
    const testNetwork = qitmeer.networks.testnet;
        const mainNetwork = qitmeer.networks.mainnet;
        let utxoAddressTest;
        let utxoAddressMain;
        try {
            utxoAddressTest = await qitmeer.ec.fromPrivateKey(Buffer.from(privatePhrase.value, 'hex'),testNetwork.pubKeyHashAddrId);
        } catch (error) {
            console.log(error,'error01');
            
            privatePhraseErr.value = '无效的输入，请再试一次。';
            return;
        }
        try {
            utxoAddressMain = await qitmeer.ec.fromPrivateKey(Buffer.from(privatePhrase.value, 'hex'),mainNetwork.pubKeyHashAddrId);
        } catch (error) {
            console.log(error,'error02');
            privatePhraseErr.value = '无效的输入，请再试一次。';
            return;
        }
        if(!utxoAddressTest || !utxoAddressMain) return;
        let account = {
            privateKey: privatePhrase.value,
            utxoAddressTest: utxoAddressTest, //UTXO测试网地址
            utxoAddressMain: utxoAddressMain, //UTXO正式网地址
        };
        saveKey()
        utxoNetwork(account)
        bus.emit('promptModalSuccess','UTXO导入成功')
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
                address: walltInfo.address, //当前用户地址
                userName: 'Wallt' + (!index ? '01' : (index + 1 > 10 ? index + 1 : '0' + (index + 1))),
                userUrl: '',
                keyStoreType:'privateKey',
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
                utxoAddressTest: walltInfo.utxoAddressTest, //当前用户测试地址
                address: walltInfo.utxoAddressMain, //当前用户地址
                userName: 'Wallt' + (!index ? '01' : (index + 1 > 10 ? index + 1 : '0' + (index + 1))),
                userUrl: '',
                keyStoreType:'privateKey',
                NoIndex: index + 1//当前第几个用户
            })
        })
        indexDbData.putData(res)
    })
}


const saveKey = async (keyName)=>{
    // 私钥加密
    let ciphertext = await Encrypt(privatePhrase.value, passKey.value);
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
</script>
<style lang='scss'>
@import '../privatePhrase.scss';
</style>
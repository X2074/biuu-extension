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
    await saveKey(keyName)
    // 创建evm
    // if(moduleType.value == 'evm'){
        await isValidPrivateKey(keyName)
    // }else{
        await generateUTXOWallet(keyName)
    // }
    bus.emit('promptModalSuccess','导入成功')
    setTimeout(() => {
        bus.emit('nextPage', 'homePage');
    }, 500)
}
// evm私钥生成钱包
const isValidPrivateKey = async (keyName)=>{
    try {
        const web3 = new Web3();
        const account = web3.eth.accounts.privateKeyToAccount(privatePhrase.value);
        console.log(account,'account');
        
        if (account && account.address) {
            account['keyStore'] = keyName;
            account['type'] = "utxo";
            evmNetwork(account)
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
const generateUTXOWallet =async (keyName)=>{
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
            type:"utxo",
            privateKey: privatePhrase.value,
            utxoAddressTest: utxoAddressTest, //UTXO测试网地址
            utxoAddressMain: utxoAddressMain, //UTXO正式网地址
            keyStore:keyName
        };
        utxoNetwork(account)
}
const evmNetwork = (walltInfo) => {
    indexDbData.getData('EVM').then(res => {
        console.log(res,'resresres');
        let data:any = {};
        // 提取数据库存储的网络 chainid
        if (!res) {//如果是第一次创建，rpc和current数据就初始化
            data['content'] = netWork.EVM;
            data['id'] = 'EVM';
            let content = {
                address: walltInfo.address,
                userName: 'Wallt 01',
                userUrl: '',
                keyStoreType:'privateKey',
                keystore:walltInfo.keystore,
                NoIndex: 1//当前第几个用户
            }
            indexDbData.putData(Object.assign({id:'currentWalltAddress'},content))
            let info = {
                id:'rpc_url',
                unit: "Meer",
                netName:"Qitmeer Testnet",
                CHAIN_ID: 8131,
                keystore:walltInfo.keystore,
                type: 'EVM',
                url: "https://testnet-qng.rpc.qitmeer.io",
                walltInfo: []
            }
            info['walltInfo'].push(content);
            indexDbData.putData(info)
            
        }else{
            data = res;
        }
        let chainId = Object.keys(data.content)
        Object.keys(netWork.EVM).forEach(item => {
            if (!chainId.includes(item)) { //如果数据库没有这个网络
                data.content[item] = netWork.EVM[item];
            }
        })
        Object.keys(data.content).forEach(item => {
            let index = data.content[item]['walltInfo'].length;
            // 如果有同名的钱包地址，直接return；
            let walltAccount = data.content[item].walltInfo.filter(item=>{
                return item.address == walltInfo.address;
            })
            if(walltAccount && walltAccount.length){
                bus.emit('promptModalErr','重复的钱包地址')
                return;
            };
            data.content[item].walltInfo.push({
                address: walltInfo.address, //当前用户地址
                userName: 'Wallt' + (!index ? '01' : (index + 1 > 10 ? index + 1 : '0' + (index + 1))),
                userUrl: '',
                keyStoreType:'privateKey',
                keyStore:walltInfo.keyStore,
                NoIndex: index + 1//当前第几个用户
            })
        })
        console.log(data, 1111111);
        indexDbData.putData(data)
        createRpc()
    })
}
const utxoNetwork = (walltInfo) => {
    indexDbData.getData('UTXO').then(res => {
        let data:any = {};
        if (!res) {
            // 新增默认utxo网络
            data['content'] = netWork['UTXO']
            data['id'] = 'UTXO';
        }else{
            data = res;
        }
        // 提取数据库存储的网络 chainid
        let chainId = Object.keys(data.content)
        Object.keys(netWork.UTXO).forEach(item => {
            if (!chainId.includes(item)) { //如果数据库没有这个网络
                data.content[item] = netWork.UTXO[item];
            }
        })
        Object.keys(data.content).forEach(item => {
            let index = data.content[item]['walltInfo'].length;
            let walltAccount = data.content[item].walltInfo.filter(item=>{
                return item.address == walltInfo.address;
            })
            if(walltAccount && walltAccount.length){
                bus.emit('promptModalErr','重复的钱包地址')
                return;
            };
            data.content[item].walltInfo.push({
                utxoAddressTest: walltInfo.utxoAddressTest, //当前用户测试地址
                address: walltInfo.utxoAddressMain, //当前用户地址
                userName: 'Wallt' + (!index ? '01' : (index + 1 > 10 ? index + 1 : '0' + (index + 1))),
                userUrl: '',
                keyStoreType:'privateKey',
                keyStore:walltInfo.keyStore,
                NoIndex: index + 1//当前第几个用户
            })
        })
        indexDbData.putData(data)
        createRpc()
    })
}
// rpc数据保存
const createRpc = async ()=>{
    // 获取是evm、utxo钱包
    let data = await indexDbData.getData('rpc_url');
    let wallt = await indexDbData.getData(data.netWorkType.toUpperCase());
    console.log(wallt,'wallt',Object.keys(wallt['content']));
    // 获取当前网络下第一个对象
    let info = wallt['content'][data['CHAIN_ID']];
    console.log(info,'info');
    
    info['id'] = 'rpc_url';
    info['type'] = data.type;
    console.log(info,'info02');
    // 更新rpc
    indexDbData.putData(info);
    // 更新当前钱包数据
    let index = info['walltInfo'].length;
    let currentWallt = info['walltInfo'][index - 1];
    currentWallt['id'] = 'currentWalltAddress';
    indexDbData.putData(currentWallt)
} 

const saveKey = async (keyName)=>{
    // 私钥加密
    let ciphertext = await Encrypt(privatePhrase.value, passKey.value);
    // 保存加密数据
    let getKeyStore = await indexDbData.getData('keyStore')
    let info:any = {};
    info[keyName] = ciphertext;
    console.log(info,'新的key');
    // 合并后的key
    let keyData:any = {};
    if(!getKeyStore){
        keyData = info;
    }else{
        keyData = Object.assign(getKeyStore.secret,info);
    }
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
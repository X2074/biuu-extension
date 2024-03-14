<template src='./index.html'></template>
<script lang='ts' setup>

import { ref, onMounted } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus.js';
import { Encrypt, Decrypt } from '@/utils/index.js';
import md5 from 'js-md5';
// 预制网络
import netWork from '@/utils/netWork.json'
import CryptoJS from 'crypto-js'; //引用AES源码js
let mnemonicList = ref([])//助记词数组
let useCheck = ref('n')//是否阅读条款
let walltInfo = ref(null)//钱包相关信息
let loading = ref(true)
let verifyBol = ref(false)
let passKey = ref('');//密码

onMounted(() => {
    // 获取设置的密码
	indexDbData.getData(md5('secret')).then(res => {
		passKey.value = res.secret;
	}).catch(err => { })

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
    UtxoEvmKey()
    setTimeout(() => {
    console.log('nextPagenextPagenextPagenextPage.value');
        bus.emit('nextPage', 'homePage');
    }, 500)
}
// 助记词加密
const UtxoEvmKey = () => {
    console.log(walltInfo.value,'walltInfo.value');
    
    let ciphertext = Encrypt(walltInfo.value.mnemonic, passKey.value);
    console.log(ciphertext, '加密后的数据');
    let data:any = {};
    data[walltInfo.value.keystore] = ciphertext;
    indexDbData.putData({
        id: 'keyStore',
        secret: data
    })
    // 存为当前展示的钱包数据
    // indexDbData.getData('currentWalltAddress').then(res => {
    //     console.log(!res, 'dasdsad');
        let content = {
            address: walltInfo.value.address,
            userName: 'Wallt 01',
            userUrl: '',
            keystore:walltInfo.value.keystore,
            NoIndex: 1//当前第几个用户
        }
        indexDbData.putData(Object.assign({id:'currentWalltAddress'},content))
        let info = {
            id:'rpc_url',
            unit: "Meer",
            netName:"Qitmeer Testnet",
            CHAIN_ID: 8131,
            keystore:walltInfo.value.keystore,
            type: 'EVM',
            url: "https://testnet-qng.rpc.qitmeer.io",
            walltInfo: []
        }
        info['walltInfo'].push(content);
        indexDbData.putData(info)
    // }).catch(err => {})
    evmNetwork();//新增并存储evm网络
    utxoNetwork();//新增并存储evm网络
}
const evmNetwork = () => {
    indexDbData.getData('EVM').then(res => {
        // 提取数据库存储的网络 chainid
        if (!res || !res.content) {
            res.content['8031'] = netWork.EVM['8031'];
            res.content['97'] = netWork.EVM['97'];
        }
        let chainId = Object.keys(res.content)
        Object.keys(netWork.EVM).forEach(item => {
            if (!chainId.includes(item)) { //如果数据库没有这个网络
                res.content[item] = netWork.EVM[item];
            }
        })
        Object.keys(res.content).forEach((item, index) => {
            res.content[item].walltInfo.push({
                address: walltInfo.value.address, //当前用户地址
                keystore:walltInfo.value.keystore,
                userName: 'Wallt 01',
                userUrl: '',
                NoIndex: index + 1//当前第几个用户
            })
        })
        console.log(res, 1111111);
        indexDbData.putData(res)
    })
}
const utxoNetwork = () => {
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
                utxoAddressTest: walltInfo.value.utxoAddressTest, //当前用户测试地址
                address: walltInfo.value.utxoAddressMain, //当前用户地址
                keystore:walltInfo.value.keystore,
                userName: 'Wallt 01',
                userUrl: '',
                NoIndex: index + 1//当前第几个用户
            })
        })
        indexDbData.putData(res)
    })
}
// 监听粘贴事件
const pasteFun = (event) => {
    event.preventDefault(); // 阻止默认粘贴行为
    verifyBol.value = true;
    let clipboardData = event.clipboardData.getData('Text');//获取粘贴内容
    console.log(clipboardData,'clipboardData01');
    clipboardData = clipboardData.replace(/\n/g, ' ')
    console.log(clipboardData,'clipboardData02');
    
    clipboardData = clipboardData.split(/\s+/).filter(Boolean);
    console.log(clipboardData,'clipboardData03');
    clipboardData.forEach((item, index) => {
        let data = {
            id: index + 1,
            mnemonic: item.replace(/\s*/g, '')
        }
        // if (walltInfo.value.mnemonicArray[index] != item.replace(/\s*/g, '')) verifyBol.value = false;
        mnemonicList.value[index] = data;
    });
}
// 添加助记词显示
const apendContent = () => {
    for (let i = 0; i <= 11; ++i) {
        let data = {
            id: i + 1,
            mnemonic: ''
        }
        mnemonicList.value.push(data)
    }
}
</script>
<style lang='scss'>
@import './index.scss';
</style>
<template src='./index.html'></template>
<script lang='ts' setup>

import { ref, onMounted, watchEffect, getCurrentInstance } from 'vue';
import indexDbData from '../../../../utils/indexDB.js';
import bus from '@/utils/bus.js';
import md5 from 'js-md5';
import Web3 from 'web3'
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
    bus.$on('mnemonicContent', (res) => {
        walltInfo.value = res;
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

    let web3 = new Web3();
    //生成keystore
    let keystore = web3.eth.accounts.encrypt(walltInfo.value.privateKey, newPsd.value);
    indexDbData.putData({
        id: walltInfo.value.address,
        userName: '',
        userUrl: '',
        logotype: 'keystore',
        keystore: keystore
    })
    // 存储密码
    indexDbData.putData({
        id: md5('secret'),
        secret: md5(newPsd.value)
    })
    // 存为当前展示的钱包数据
    indexDbData.getData('currentWalltAddress').then(res => {
        if (res && res.address) {
            indexDbData.putData({
                id: 'currentWalltAddress',
                address: walltInfo.value.address,
                userName: '',
                userUrl: '',
                NoIndex: res.NoIndex + 1//当前第几个用户
            })
        } else {
            indexDbData.putData({
                id: 'currentWalltAddress',
                userName: '',
                userUrl: '',
                address: walltInfo.value.address,
                NoIndex: 1
            })
        }
    }).catch(err => { })
    indexDbData.putData({
        id: 'rpc_url',
        unit: 'ETH',
        CHAIN_ID: 1,
        url: 'https://bsc-dataseed1.ninicoin.io'
    })
    indexDbData.putData({
        id: 'currentWalltAddress',
        address: walltInfo.value.address
    })
    // setTimeout(()=>{
    // 	$emit('nextPage','userContent');
    // },500)
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
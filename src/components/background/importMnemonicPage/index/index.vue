<template src='./index.html'></template>
<script lang='ts' setup>

import { ref, onMounted, watchEffect, getCurrentInstance } from 'vue';
import indexDbData from '../../../../utils/indexDB.js';
import bus from '@/utils/bus.js';
import md5 from 'js-md5';
import bip39 from 'bip39'
import { hdkey } from 'ethereumjs-wallet'
import util from 'ethereumjs-util'
import eip55 from 'eip55'
import Web3 from 'web3'
const mnemonicList = ref([])
const newPsd = ref('')//钱包密码
const confirmPsd = ref('')//钱包密码
const newPsdBol = ref(false)
const confirmPsdBol = ref(false)
const useCheck = ref('n')//是否阅读条款
const walltInfo = ref(null)//钱包相关信息
const loading = ref(false)
const mnemonicArray = ref(null)//助记词数组
const web3 = ref(new Web3())
const mnemonic = ref('')//助记词

// 监听粘贴事件
const pasteFun = (e) => {
    let clipboardData = e.clipboardData.getData('Text');//获取粘贴内容
    mnemonic.value = clipboardData;
    clipboardData = clipboardData.split(' ');
    mnemonicList.value = [];
    clipboardData.forEach((item, index) => {
        let data = {
            id: index + 1,
            mnemonic: item,
            yn: 'y'
        }
        mnemonicList.value.push(data);
    });
    console.log(mnemonicList.value);
}
// 生成keystory文件
const creatKeyStory = () => {
    if (!mnemonic.value) return;
    newPsdBol.value = false;
    confirmPsdBol.value = false;
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
    createWallet().then(res => {
        console.log(res, 88888888);
        //生成keystore
        let keystore = web3.value.eth.accounts.encrypt(res.privateKey, newPsd.value);
        indexDbData.putData({
            id: res.address,
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
        setTimeout(() => {
            // $emit('nextPage','userContent');
        }, 500)
    }).catch(err => { })
}
// 添加助记词显示
const apendContent = () => {
    for (let i = 0; i <= 11; ++i) {
        let data = {
            id: i + 1,
            mnemonic: '',
            yn: 'y'
        }
        console.log(i);
        mnemonicList.value.push(data)
    }
}
// 生成相关信息
const createWallet = async () => {
    try {
        //将助记词转成seed
        let seed = bip39.mnemonicToSeedSync(mnemonic.value);
        //通过hdkey将seed生成HD Wallet
        let hdWallet = hdkey.fromMasterSeed(seed);
        //生成钱包中在m/44'/60'/0'/0/0路径的keypair;
        let key = hdWallet.derivePath("m/44'/60'/0'/0/0");
        //从keypair中获取私钥
        let privateKey = util.bufferToHex(key._hdkey._privateKey);
        console.log('钱包私钥', privateKey);
        //从keypair中获取公钥
        let publicKey = util.bufferToHex(key._hdkey._publicKey);
        //使用keypair中的公钥生成地址
        let address = util.pubToAddress(key._hdkey._publicKey, true);
        let addressText = eip55.encode(address.toString('hex'));
        console.log('钱包地址', address);
        return {
            mnemonic: mnemonic.value, //助记词
            privateKey: privateKey, //私钥
            publicKey: publicKey, //公钥
            address: addressText, //钱包地址
            keystore: {} //钱包的keystore
        }
    } catch (err) {
        console.log(err);
    }
}
const onPage = () => {
    bus.emit('nextPage', 'create');
}
</script>
<style lang='scss'>
@import './index.scss';
</style>
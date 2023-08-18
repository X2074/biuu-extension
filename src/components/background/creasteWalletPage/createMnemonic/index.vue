<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, watchEffect, getCurrentInstance } from 'vue';

// import bip39 from 'bip39'
// import { hdkey } from 'ethereumjs-wallet'
// import util from 'ethereumjs-util'
// import eip55 from 'eip55'
import database from '../../../../utils/indexDB.js';
import Web3 from 'web3';
import bus from '../../../../utils/bus.js';
const { hdkey } = require('ethereumjs-wallet')
const util = require('ethereumjs-util')
const eip55 = require('eip55')
const bip39 = require('bip39')

const loading = ref(true)
const mnemonicArray = ref('')
const passMnemonic = ref(true)
onMounted(() => {
    createWallet()
})
const nextPage = () => {
    //   this.$emit('nextPage','createWallt')
}// 生成相关信息
const createWallet = async () => {
    try {
        // 1.生成助记词
        // 生成随机熵
        // let entropy = bip39.randomBytes(16);
        // 将熵转换为助记词
        // let mnemonic = bip39.entropyToMnemonic(entropy);
        let mnemonic = bip39.generateMnemonic();
        console.log(mnemonic, 'bip39');
        mnemonicArray.value = mnemonic.split(' ');
        console.log(mnemonicArray.value, 'mnemonicArray');

        //2.将助记词转成seed
        let seed = bip39.mnemonicToSeedSync(mnemonic);
        //3.通过hdkey将seed生成HD Wallet
        let hdWallet = hdkey.fromMasterSeed(seed);
        //4.生成钱包中在m/44'/60'/0'/0/0路径的keypair;
        let key = hdWallet.derivePath("m/44'/60'/0'/0/0");
        //5.从keypair中获取私钥
        let privateKey = util.bufferToHex(key._hdkey._privateKey);
        console.log('钱包私钥', privateKey);
        //6.从keypair中获取公钥
        let publicKey = util.bufferToHex(key._hdkey._publicKey);
        //7.使用keypair中的公钥生成地址
        let address = util.pubToAddress(key._hdkey._publicKey, true);
        address = eip55.encode(address.toString('hex'));
        console.log('钱包地址', address);
        return {
            mnemonicArray: mnemonicArray.value,
            mnemonic: mnemonic, //助记词
            privateKey: privateKey, //私钥
            publicKey: publicKey, //公钥
            address: address, //钱包地址
            keystore: {} //钱包的keystore
        }
    } catch (err) {
        console.log(err, '55555555');
    }
}
</script>
<style lang='scss'>
@import './index.scss';
</style> 
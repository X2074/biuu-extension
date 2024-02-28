<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, watchEffect, getCurrentInstance } from 'vue';
import bus from '@/utils/bus.js';
import qitmeer from 'qitmeer-js'
import ethUtil from 'ethereumjs-util'
import bip39 from 'bip39'
import eip55 from 'eip55'
// 使用最新版本浏览器不支持，只能使用1.x版本替换
import ecc from 'tiny-secp256k1'
import { BIP32Factory } from 'bip32'
const bip32 = BIP32Factory(ecc)

const mnemonicArray = ref('')
const passMnemonic = ref(true)
onMounted(() => {
    createWallet().then(res => {
        bus.emit('mnemonicContent', res);
    })
})
const nextPage = () => {
    bus.emit('nextCreatePage', 'verifyMnemonic')
}// 生成相关信息
const createWallet = async () => {
    try {
        // 1.生成助记词
        let mnemonic = bip39.generateMnemonic();
        // let mnemonic = 'plug family sugar pistol expire canyon rug conduct road sausage weapon crack'
        console.log(mnemonic, 'bip39');
        mnemonicArray.value = mnemonic.split(' ');
        // console.log(mnemonicArray.value, '助记词');
        // //2.将助记词转成seed
        let seed = await bip39.mnemonicToSeed(mnemonic, '');
        // console.log(seed, '将助记词转成seed');
        // // 通过种子生成BIP32主节点
        const hdWallet = bip32.fromSeed(seed);
        // console.log(hdWallet, '将助记词转成seed');
        // const rootPrivateKey = hdWallet.privateKey.toString('hex');
        // const rootPublicKey = hdWallet.publicKey.toString('hex');
        // console.log('私钥:', rootPrivateKey);
        // console.log('公钥:', rootPublicKey);
        const testNetwork = qitmeer.networks.testnet;
        console.log('Meer UTXO Address:', testNetwork)
        const mainNetwork = qitmeer.networks.mainnet;
        const hash160 = qitmeer.hash.hash160(hdWallet.publicKey);
        const p2pkhAddressTest = qitmeer.address.toBase58Check(hash160, testNetwork.pubKeyHashAddrId);
        const p2pkhAddressMain = qitmeer.address.toBase58Check(hash160, mainNetwork.pubKeyHashAddrId);
        // //4.派生一个子密钥对的BIP32导出路径
        let key = hdWallet.derivePath("m/44'/60'/0'/0/0");
        // // 获取子私钥的WIF格式
        // const privateKeyWIF = key.toWIF();
        // // 获取子公私钥的十六进制格式
        const privateKeyHex = key.privateKey.toString('hex');
        const publicKeyHex = key.publicKey.toString('hex');

        let address = ethUtil.publicToAddress(key.publicKey, true).toString('hex');
        address = eip55.encode(address.toString('hex'));
        console.log(address, 'address');

        // console.log('私钥(WIF):', privateKeyWIF);
        console.log('私钥 (Hex):', privateKeyHex);
        // console.log('公钥 (Hex):', publicKeyHex);
        // console.log({
        //     mnemonic, privateKeyHex, publicKeyHex, address
        // });
        return {
            mnemonicArray: mnemonicArray.value,
            mnemonic: mnemonic, //助记词
            privateKey: privateKeyHex, //私钥
            publicKey: publicKeyHex, //公钥
            address: address, //钱包地址
            keystore: address, //钱包的keystore
            // utxoRootPrivateKey: rootPrivateKey, //私钥
            // utxoRootPublicKey: rootPublicKey, //公钥
            utxoAddressTest: p2pkhAddressTest, //UTXO测试网地址
            utxoAddressMain: p2pkhAddressMain, //UTXO正式网地址

        }
    } catch (err) {
        console.log(err, '33333');
    }
}
</script>
<style lang='scss'>
@import './index.scss';
</style> 
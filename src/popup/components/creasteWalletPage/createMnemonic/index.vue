<template src='./index.html'></template>
<script lang='ts'>
export default {
  name: 'createMnemonic'
};
</script>
<script lang='ts' setup>
import { ref, onMounted } from 'vue';
import bus from '@/utils/bus.js';
import qitmeer from 'qitmeer-js';
import ethUtil from 'ethereumjs-util';
import bip39 from 'bip39';
import eip55 from 'eip55';
import { v4 as uuidv4 } from 'uuid';
// 使用最新版本浏览器不支持，只能使用1.x版本替换
import ecc from 'tiny-secp256k1';
import { BIP32Factory } from 'bip32';
const bip32 = BIP32Factory(ecc);

const mnemonicArray: any = ref('');
const passMnemonic = ref(true);
onMounted(() => {
  createWallet().then((res) => {
    bus.emit('mnemonicContent', res);
  });
});
const nextPage = () => {
  bus.emit('nextCreatePage', 'verifyMnemonic');
}; // 生成相关信息
const createWallet = async () => {
  try {
    // 1.生成助记词
    let mnemonic = bip39.generateMnemonic();
    console.log(mnemonic, 'bip39');
    mnemonicArray.value = mnemonic.split(' ');
    // //2.将助记词转成seed
    let seed = await bip39.mnemonicToSeed(mnemonic, '');
    // console.log(seed, '将助记词转成seed');
    // // 通过种子生成BIP32主节点
    const hdWallet = bip32.fromSeed(seed);
    const testNetwork = qitmeer.networks.testnet;
    console.log('Meer UTXO Address:', testNetwork);
    const mainNetwork = qitmeer.networks.mainnet;
    const hash160 = qitmeer.hash.hash160(hdWallet.publicKey);
    // utxo部分的助记词数据
    const p2pkhAddressTest = qitmeer.address.toBase58Check(hash160, testNetwork.pubKeyHashAddrId);
    const p2pkhAddressMain = qitmeer.address.toBase58Check(hash160, mainNetwork.pubKeyHashAddrId);
    // 4.派生一个子密钥对的BIP32导出路径
    let key: any = hdWallet.derivePath("m/44'/60'/0'/0/0");
    //获取子公私钥的十六进制格式
    const privateKeyHex = key.privateKey.toString('hex');
    const publicKeyHex = key.publicKey.toString('hex');

    let address: any = ethUtil.publicToAddress(key.publicKey, true).toString('hex');
    address = eip55.encode(address.toString('hex'));
    console.log(address, 'address');
    console.log('私钥 (Hex):', privateKeyHex);
    return {
      mnemonicArray: mnemonicArray.value,
      mnemonic: mnemonic, //助记词
      privateKey: privateKeyHex, //私钥
      publicKey: publicKeyHex, //公钥
      address: address, //钱包地址
      keyStore: uuidv4(), //钱包的对象名
      utxoAddressTest: p2pkhAddressTest, //UTXO测试网地址
      utxoAddressMain: p2pkhAddressMain //UTXO正式网地址
    };
  } catch (err: any) {
    console.log(err, '33333');
  }
};
</script>
<style lang='scss'>
@import './index.scss';
</style> 
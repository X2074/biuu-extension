
<template src='./index.html'></template>
<style scoped lang='scss'>
@import './index.scss';
</style>
<script lang='ts' setup>
import { ref, onMounted, toRaw } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import qitmeer from 'qitmeer-js';
import bip39 from 'bip39';
import ecc from 'tiny-secp256k1';
import { BIP32Factory } from 'bip32';
const bip32 = BIP32Factory(ecc);
onMounted(async () => {
  console.log(qitmeer, 'qitmeer');
  generateKeysFromMnemonic('mountain orange risk fury firm super avoid cement grant budget labor adjust');
});
const generateKeysFromMnemonic = async (mnemonic: any) => {
  const seed = await bip39.mnemonicToSeed(mnemonic, '');
  const entropy = bip39.mnemonicToEntropy(mnemonic);
  console.log('seed:', seed);
  console.log('seed:', seed.toString('hex'));
  // 通过种子生成BIP32主节点
  const masterNode: any = bip32.fromSeed(seed);
  const rootPrivateKey = masterNode.privateKey.toString('hex');
  const rootPublicKey = masterNode.publicKey.toString('hex');
  console.log('rootPrivateKey:', rootPrivateKey);
  console.log('rootPublicKey:', rootPublicKey);

  console.log('Meer UTXO Address:');
  const testNetwork = qitmeer.networks.testnet;
  const mainNetwork = qitmeer.networks.mainnet;
  const hash160 = qitmeer.hash.hash160(masterNode.publicKey);
  const p2pkhAddressTest = qitmeer.address.toBase58Check(hash160, testNetwork.pubKeyHashAddrId);
  const p2pkhAddressMain = qitmeer.address.toBase58Check(hash160, mainNetwork.pubKeyHashAddrId);

  console.log(p2pkhAddressTest, p2pkhAddressMain, hash160.toString('hex'), entropy, rootPublicKey);
  console.log('Meer derive address(evm address):');
  // 派生一个子密钥对的BIP32导出路径
  const path = "m/44'/60'/0'/0/0"; // 你可以更改路径来生成不同的子密钥
  const childNode = masterNode.derivePath(path);

  const pkaddr = qitmeer.address.ecToPkAddress(childNode.publicKey, 'testnet');
  console.log('pkaddr:', pkaddr);
};
</script>
<template src='./index.html'></template>
<script lang="ts">
export default {
  name: 'importPhrase'
};
</script>
<script lang='ts' setup>
import { ref } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus.js';
import { Encrypt } from '@/utils/index';
import md5 from 'js-md5';
import * as bip39 from 'bip39';
import { createWallet } from '@/utils/createUser.js';
// 预制网络
import { netWork } from '@/utils/defaultNetwork.js';

import { rpcConfig, defaultAccount, defaultUTXOAccount } from '@/config/configuration';
let mnemonicPhrase: any = ref(null);
let mnemonicPhraseErr = ref('');
let passKey = ref(''); //密码
// 获取设置的密码
indexDbData
  .getData(md5('secret'))
  .then((res: any) => {
    passKey.value = res.secret;
  })
  .catch((err: any) => {
    console.log(err);
  });
// 确认
const mnemonicPhraseConfirm = async () => {
  mnemonicPhraseErr.value = '';
  if (!mnemonicPhrase.value) {
    mnemonicPhraseErr.value = '请输入助记词';
    return;
  }
  var regex = /^[a-zA-Z0-9\s]*$/; // 只允许输入数字和字母
  if (!regex.test(mnemonicPhrase.value)) {
    mnemonicPhraseErr.value = '无效的输入，请再试一次。';
    return;
  }
  if (!bip39.validateMnemonic(mnemonicPhrase.value)) {
    mnemonicPhraseErr.value = '无效的输入，请再试一次。';
    return;
  }
  let data = mnemonicPhrase.value.split(' ');
  console.log(data, 'data');

  if (data.length && data.length != 12 && data.length != 18 && data.length != 24) {
    mnemonicPhraseErr.value = '无效的输入，请再试一次。02';
    return;
  }
  // 助记词生成的数据
  let createData: any = await createWallet(mnemonicPhrase.value);
  let evmData = await indexDbData.getData('EVM');
  let utxoData = await indexDbData.getData('UTXO');
  let dataWallt;
  if (evmData) {
    for (const key in evmData['content']) {
      dataWallt = evmData['content'][key]['walltInfo'].filter((item: any) => {
        return item.address == createData.address;
      });
    }
  }
  if (utxoData) {
    for (const key in utxoData['content']) {
      dataWallt = utxoData['content'][key]['walltInfo'].filter((item: any) => {
        return item.address == createData.address || item.utxoAddressTest == createData.utxoAddressTest;
      });
    }
  }
  if (dataWallt && dataWallt.length) {
    bus.emit('promptModalErr', '重复的钱包地址');
    return;
  }
  console.log(dataWallt, 'dataWallt');

  saveKey(createData['keyStore']);
  evmNetwork(createData); //新增并存储evm网络
  utxoNetwork(createData); //新增并存储evm网络
  bus.emit('promptModalSuccess', '导入成功');
  setTimeout(() => {
    bus.emit('nextPage', 'homePage');
  }, 500);
};

// 保存key
const saveKey = async (keyName: any) => {
  // 私钥加密
  let ciphertext = await Encrypt(mnemonicPhrase.value, passKey.value);
  // 保存加密数据
  let getKeyStore = await indexDbData.getData('keyStore');
  console.log(getKeyStore, '老的key');
  let info: any = {};
  info[keyName] = ciphertext;
  console.log(info, '新的key');
  // 合并后的key
  let keyData: any = {};
  if (!getKeyStore) {
    keyData = info;
  } else {
    keyData = Object.assign(getKeyStore.secret, info);
  }
  // 保存key
  indexDbData.putData({
    id: 'keyStore',
    secret: keyData
  });
};
const evmNetwork = (walltInfo: any) => {
  indexDbData.getData('EVM').then((res: any) => {
    // 提取数据库存储的网络 chainid
    let data: any = {};
    if (!res) {
      data['content'] = netWork.EVM;
      data['id'] = 'EVM';
      data['NoIndex'] = 1;

      let content: any = defaultAccount;
      content['address'] = walltInfo.address;
      content['keyStore'] = walltInfo.keyStore;
      content['netWorkType'] = 'EVM';
      indexDbData.putData(Object.assign({ id: 'currentWalltAddress' }, content));
      let info: any = rpcConfig['evmTest'];
      info['NoIndex'] = 1;
      info['walltInfo'].push(content);
      indexDbData.putData(info);
    } else {
      data = res;
      data['NoIndex'] = data['NoIndex'] + 1;
      createRpc();
    }
    let chainId = Object.keys(data.content);
    Object.keys(netWork.EVM).forEach((item) => {
      if (!chainId.includes(item)) {
        //如果数据库没有这个网络
        let netWorkType: any = netWork.EVM;
        data.content[item] = netWorkType[item];
      }
    });
    Object.keys(data.content).forEach((item) => {
      let index = data['NoIndex'];
      data.content[item]['NoIndex'] = index + 1;
      let account: any = defaultAccount;
      account['address'] = walltInfo.address;
      account['userName'] = 'Wallt' + (!index ? '01' : index > 10 ? index : '0' + index);
      account['keyStore'] = walltInfo['keyStore'];
      account['NoIndex'] = data['NoIndex'];
      data.content[item].walltInfo.push(account);
    });
    console.log(data, 1111111);
    indexDbData.putData(data);
  });
};
const utxoNetwork = (walltInfo: any) => {
  indexDbData.getData('UTXO').then((res: any) => {
    let data: any = {};
    if (!res) {
      // 新增默认utxo网络
      data['content'] = netWork['UTXO'];
      data['id'] = 'UTXO';
      data['NoIndex'] = 1;
    } else {
      data = res;
      data['NoIndex'] = data['NoIndex'] + 1;
      createRpc();
    }
    // 提取数据库存储的网络 chainid
    let chainId = Object.keys(data.content);
    Object.keys(netWork.UTXO).forEach((item) => {
      if (!chainId.includes(item)) {
        //如果数据库没有这个网络
        let netWorkType: any = netWork.EVM;
        data.content[item] = netWorkType[item];
      }
    });
    Object.keys(data.content).forEach((item) => {
      let index = data['NoIndex'];
      data.content[item]['NoIndex'] = index + 1;
      // 给新增的utxo账号赋值
      let utxoAccount: any = defaultUTXOAccount;
      utxoAccount['utxoAddressTest'] = walltInfo.utxoAddressTest;
      utxoAccount['address'] = walltInfo.utxoAddressMain;
      utxoAccount['keyStore'] = walltInfo.keyStore;
      utxoAccount['NoIndex'] = data['NoIndex'];
      utxoAccount['userName'] = 'Wallt' + (!index ? '01' : index > 10 ? index : '0' + index);
      data.content[item].walltInfo.push(utxoAccount);
    });
    indexDbData.putData(data);
  });
};
// rpc数据保存
const createRpc = async () => {
  // 获取是evm、utxo钱包
  let data = await indexDbData.getData('rpc_url');
  let wallt = await indexDbData.getData(data.netWorkType.toUpperCase());
  // 获取当前网络下第一个对象
  let info = wallt['content'][Object.keys(wallt['content'])[0]];
  console.log(info, 'info');

  info['id'] = 'rpc_url';
  info['netWorkType'] = data.netWorkType;
  console.log(info, 'info02');
  // 更新rpc
  indexDbData.putData(info);
  // 更新当前钱包数据
  let currentWallt = info['walltInfo'][0];
  currentWallt['id'] = 'currentWalltAddress';
  console.log(currentWallt, 'currentWallt');

  indexDbData.putData(currentWallt);
};
</script>
<style lang='scss'>
@import '../privatePhrase.scss';
</style>
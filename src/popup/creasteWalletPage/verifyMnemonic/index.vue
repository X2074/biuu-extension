<template src='./index.html'></template>
<script lang='ts'>
export default {
  name: 'verifyMnemonic'
};
</script>
<script lang='ts' setup>
import { ref, onMounted } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus.js';
import { Encrypt } from '@/utils/index';
import md5 from 'js-md5';
// 预制网络
import { netWork } from '@/utils/defaultNetwork.js';
import { rpcConfig, defaultAccount, defaultUTXOAccount } from '@/config/configuration';
let mnemonicList: any = ref([]); //助记词数组
let walltInfo: any = ref(null); //钱包相关信息
let verifyBol = ref(false);
let passKey = ref(''); //密码

onMounted(() => {
  // 获取设置的密码
  indexDbData
    .getData(md5('secret'))
    .then((res: any) => {
      passKey.value = res.secret;
    })
    .catch(() => {});

  bus.on('mnemonicContent', (res: any) => {
    console.log(res, '第二部验证');
    walltInfo.value = res;
  });
  // 存储evm、utxo
  indexDbData.putData({
    id: 'EVM',
    content: {},
    keyStore: null
  });
  indexDbData.putData({
    id: 'UTXO',
    content: {},
    keyStore: null
  });
  apendContent();
});

// 生成keystory文件
const creatKeyStory = () => {
  UtxoEvmKey();
  setTimeout(() => {
    console.log('nextPagenextPagenextPagenextPage.value');
    bus.emit('nextPage', 'homePage');
  }, 500);
};
// 助记词加密
const UtxoEvmKey = () => {
  let ciphertext = Encrypt(walltInfo.value.mnemonic, passKey.value);
  console.log(ciphertext, '加密后的数据');
  let data: any = {};
  data[walltInfo.value.keyStore] = ciphertext;
  indexDbData.putData({
    id: 'keyStore',
    secret: data
  });
  // let content = {
  //   address: walltInfo.value.address,
  //   userName: 'Wallt 01',
  //   userUrl: '',
  //   keyStore: walltInfo.value.keyStore,
  //   NoIndex: 1 //当前第几个用户
  // };
  let content: any = defaultAccount;
  content['address'] = walltInfo.address;
  content['keyStore'] = walltInfo.keyStore;
  content['userName'] = 'Wallt 01';
  content['netWorkType'] = 'EVM';
  indexDbData.putData(Object.assign({ id: 'currentWalltAddress' }, content));
  let info: any = rpcConfig['evmTest'];
  info['NoIndex'] = 1;
  info['walltInfo'].push(content);
  indexDbData.putData(info);
  evmNetwork(); //新增并存储网络
  utxoNetwork(); //新增并存储网络
};
const evmNetwork = () => {
  indexDbData.getData('EVM').then((res: any) => {
    // 提取数据库存储的网络 chainid
    if (!res || !res.content) {
      let netWorkEvm: any = netWork.EVM;
      res.content['8031'] = netWorkEvm['8031'];
      res.content['97'] = netWork.EVM['97'];
    }
    let chainId = Object.keys(res.content);
    Object.keys(netWork.EVM).forEach((item) => {
      if (!chainId.includes(item)) {
        let netWorkEvm: any = netWork.EVM;
        //如果数据库没有这个网络
        res.content[item] = netWorkEvm[item];
      }
    });
    Object.keys(res.content).forEach((item) => {
      res.content[item]['NoIndex'] = 1;
      let walltAccount: any = defaultAccount;
      walltAccount['address'] = walltInfo.value.address;
      walltAccount['keyStore'] = walltInfo.value.keyStore;
      walltAccount['netWorkType'] = 'EVM';
      res.content[item].walltInfo.push(walltAccount);
    });
    res['NoIndex'] = 1;
    indexDbData.putData(res);
  });
};
const utxoNetwork = () => {
  indexDbData.getData('UTXO').then((res: any) => {
    if (!res || !res.content) {
      // 新增默认utxo网络
      res.content = {
        8131: rpcConfig['uxtoTest']
      };
    }
    // 提取数据库存储的网络 chainid
    let chainId = Object.keys(res.content);
    Object.keys(netWork.UTXO).forEach((item) => {
      if (!chainId.includes(item)) {
        //如果数据库没有这个网络
        let netWorkUtxo: any = netWork.UTXO;
        res.content[item] = netWorkUtxo[item];
      }
    });
    Object.keys(res.content).forEach((item) => {
      res.content[item]['NoIndex'] = 1;
      // 给新增的utxo账号赋值
      let utxoAccount: any = defaultUTXOAccount;
      utxoAccount['utxoAddressTest'] = walltInfo.value.utxoAddressTest;
      utxoAccount['address'] = walltInfo.value.utxoAddressMain;
      utxoAccount['keyStore'] = walltInfo.value.keyStore;
      res.content[item].walltInfo.push(utxoAccount);
    });
    indexDbData.putData(res);
  });
};
// 监听粘贴事件
const pasteFun = (event: any) => {
  event.preventDefault(); // 阻止默认粘贴行为
  verifyBol.value = true;
  let clipboardData = event.clipboardData.getData('Text'); //获取粘贴内容
  console.log(clipboardData, 'clipboardData01');
  clipboardData = clipboardData.replace(/\n/g, ' ');
  console.log(clipboardData, 'clipboardData02');

  clipboardData = clipboardData.split(/\s+/).filter(Boolean);
  console.log(clipboardData, 'clipboardData03');
  clipboardData.forEach((item: any, index: any) => {
    let data = {
      id: index + 1,
      mnemonic: item.replace(/\s*/g, '')
    };
    mnemonicList.value[index] = data;
  });
};
// 添加助记词显示
const apendContent = () => {
  for (let i = 0; i <= 11; ++i) {
    let data = {
      id: i + 1,
      mnemonic: ''
    };
    mnemonicList.value.push(data);
  }
};
</script>
<style lang='scss'>
@import './index.scss';
</style>
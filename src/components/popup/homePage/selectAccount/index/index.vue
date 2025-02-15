<template src='./index.html'></template>
<script lang="ts" >
export default {
  name: 'selectAccount'
};
</script>
<script lang='ts' setup>
import { ref, onMounted, toRaw, defineProps } from 'vue';
import bus from '@/utils/bus.js';
import indexDbData from '@/utils/indexDB';
import { Encrypt, Decrypt } from '@/utils/index.js';
import { createMnemonic, createWallet } from '@/utils/createUser';
import showPrivateKey from '../showPrivateKey/index.vue';
import importWallet from '../../../components/importWallet/index.vue';
import deleteWallt from '../deleteWallt/index.vue';
import { getBlance } from '@/utils/index';
import Web3 from 'web3';
import md5 from 'js-md5';
let accountList = ref([]);
let nowAccount: any = ref(null);
let accountContent: any = ref(null);
let passKey = ref(''); //密码

let checkAddressText = ref('');
let accountType = ref(''); //当前展示钱包那一套流程

let loading = ref(false);
let loadingText = ref('加载中...');

let prop = defineProps(['pageType']);
onMounted(async () => {
  loading.value = true;
  await initializeInfo();
  if (prop && prop.pageType) {
    indexDbData.getData('currentWalltAddress').then((res) => {
      checkAddressText.value = res.address;
      accountType.value = prop.pageType;
    });
  } else {
    accountType.value = 'list';
  }
});

const initializeInfo = async () => {
  // 获取设置的密码
  indexDbData
    .getData(md5('secret'))
    .then((res) => {
      passKey.value = res.secret;
    })
    .catch((err) => {});
  // 获取当前展示的钱包数据
  nowAccount.value = await indexDbData.getData('currentWalltAddress');
  accountContent.value = await indexDbData.getData('rpc_url');
  // 指定钱包单位\
  let data = accountContent.value.walltInfo.reverse();
  data.forEach((item: any) => {
    item.blance = 0;
  });
  accountList.value = data;
  accountList.value.forEach((item: any) => {
    getBlance(accountContent.value.url, Object.assign({ netWorkType: accountContent.value.netWorkType }, item)).then(
      (res) => {
        item.blance = res;
      }
    );
  });
  console.log(data, 'data');
  loading.value = false;
};
// 创建账号
const createAccount = async () => {
  loading.value = true;
  let mnemonic = await createMnemonic();
  let account: any = await createWallet(mnemonic);
  console.log(account, 'account');
  // 助记词加密
  let ciphertext = Encrypt(mnemonic, passKey.value);
  // 保存加密数据
  indexDbData.getData('keyStore').then((res) => {
    let data: any = {};
    console.log(res.secret, '老的key');
    let info: any = {};
    info[account['keyStore']] = ciphertext;
    console.log(info, '新的key');

    data = Object.assign(res.secret, info);
    console.log(data, '合并的key');
    // 保存key
    indexDbData.putData({
      id: 'keyStore',
      secret: data
    });
  });

  indexDbData.getData('currentWalltAddress').then((res) => {
    let index = accountContent.value['NoIndex'] + 1;
    let content = {
      id: 'currentWalltAddress',
      address: account['address'],
      userName: 'Wallt' + (index > 10 ? index : '0' + index + 1),
      userUrl: '',
      keyStore: account['keyStore'],
      NoIndex: index //当前第几个用户
    };
    // 存为当前展示的钱包数据
    indexDbData
      .getData('currentWalltAddress')
      .then((res) => {
        indexDbData.putData(content);
      })
      .catch((err) => {});
    // 存为当前选中的网络中数据
    indexDbData.getData('rpc_url').then((res) => {
      res['NoIndex'] = res['NoIndex'] + 1;
      res.walltInfo.push(content);
      // 保存key
      indexDbData.putData(res);
    });
    evmNetwork(account); //新增并存储evm网络
    utxoNetwork(account); //新增并存储evm网络
    setTimeout(() => {
      initializeInfo();
      loading.value = false;
    }, 500);
  });
};

const evmNetwork = (data: any) => {
  let index = accountContent.value['NoIndex'] + 1;
  indexDbData.getData('EVM').then((res) => {
    res['NoIndex'] = index;
    Object.keys(res.content).forEach((item) => {
      res.content[item]['NoIndex'] = index;
      res.content[item].walltInfo.push({
        address: data.address, //当前用户地址
        userName: 'Wallt' + (index > 10 ? index + 1 : '0' + index),
        userUrl: '',
        keyStore: data['keyStore'],
        NoIndex: index //当前第几个用户
      });
    });
    indexDbData.putData(res);
  });
};
const utxoNetwork = (data: any) => {
  let index: any = accountContent.value['NoIndex'] + 1;
  indexDbData.getData('UTXO').then((res) => {
    res['NoIndex'] = index;
    Object.keys(res.content).forEach((item) => {
      res.content[item]['NoIndex'] = index;
      res.content[item].walltInfo.push({
        utxoAddressTest: data.utxoAddressTest, //当前用户测试地址
        address: data.utxoAddressMain, //当前用户地址
        userName: 'Wallt' + (index > 10 ? '' : '0') + index,
        userUrl: '',
        keyStore: data['keyStore'],
        NoIndex: index + 1 //当前第几个用户
      });
    });
    indexDbData.putData(res);
  });
};

// 选中的账号
const checkAddress = (data: any) => {
  checkAddressText.value = data.address;
  accountType.value = 'model';
  // accountType.value = 'showKey';
};
// 选为主账号
const checkAccount = () => {
  if (checkAddressText.value == nowAccount.value.address) {
    bus.emit('promptModalWarn', '当前已是主账号');
    return;
  }
  let data = toRaw(accountList.value);
  let dbData = data.filter((item) => {
    return item.address == checkAddressText.value;
  });
  if (!dbData || !dbData.length) {
    bus.emit('promptModalErr', '您选择的账号有误');
    return;
  }
  console.log(dbData, 'data[0]');
  let currentWallt: any = dbData[0];
  currentWallt['id'] = 'currentWalltAddress';
  indexDbData.putData(currentWallt);
  setTimeout(() => {
    bus.emit('nextPage', 'homePage');
  }, 300);
};
// 上一页
const backPage = () => {
  bus.emit('nextPage', '');
};

bus.on('selectAccountPage', (res: any) => {
  console.log(res, 'resresresres');

  if (res == 'list') {
    loading.value = true;
    accountType.value = 'list';
    initializeInfo();
  }
});
</script>
<style lang="scss">
@import './index.scss';
</style>
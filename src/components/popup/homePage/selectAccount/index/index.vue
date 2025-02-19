<template src='./index.html'></template>
<script lang="ts" >
export default {
  name: 'selectAccount'
};
</script>
<script lang='ts' setup>
import { ref, onMounted, toRaw, defineProps } from 'vue';
import bus from '@/utils/bus.js';
import indexDbData from '@/utils/indexDB.js';
import { Encrypt } from '@/utils/index.js';
import { createMnemonic, createWallet } from '@/utils/createUser.js';
import showPrivateKey from '../showPrivateKey/index.vue';
import importWallet from '../../../components/importWallet/index.vue';
import deleteWallt from '../deleteWallt/index.vue';
import { getBlance } from '@/utils/index.js';
import { addBalance } from '@/utils/UTXO/meerRpc.js';
import md5 from 'js-md5';
import { rpcConfig, defaultAccount, defaultUTXOAccount } from '@/config/configuration';
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
    .then((res: any) => {
      passKey.value = res.secret;
    })
    .catch(() => {});
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
    console.log('accountContent', Object.assign({ netWorkType: accountContent.value.netWorkType }, item));
    getBlance(accountContent.value.url, Object.assign({ netWorkType: accountContent.value.netWorkType }, item)).then(
      (res: any) => {
        item.blance = res;
      }
    );
  });
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
  indexDbData.getData('keyStore').then((res: any) => {
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
  evmNetwork(account); //新增并存储evm网络
  try {
    await utxoNetwork(account); //新增并存储evm网络
    setTimeout(() => {
      initializeInfo();
      loading.value = false;
    }, 500);
  } catch (error) {}
  // });
};

const evmNetwork = (data: any) => {
  let index = Number(accountContent.value['NoIndex']) + 1;
  let content: any = defaultAccount;
  content['address'] = data.address;
  content['keyStore'] = data.keyStore;
  content['userName'] = 'Wallt' + (index > 10 ? index + 1 : '0' + index);
  content['netWork'] = 'EVM';
  content['NoIndex'] = index;
  indexDbData.getData('EVM').then((res: any) => {
    res['NoIndex'] = index;
    Object.keys(res.content).forEach((item) => {
      res.content[item]['NoIndex'] = index;
      res.content[item].walltInfo.push(content);
    });
    indexDbData.putData(res);
  });
  appendRecCurrent(content);
};
const utxoNetwork = async (data: any) => {
  let rpcData: any = await indexDbData.getData('rpc_url');
  // 创建完utxo账户后需要新增节点方法，让节点对该地址进行关注
  await addBalance(rpcData['url'], data['utxoAddressTest']);
  let index = Number(accountContent.value['NoIndex']) + 1;
  // 给新增的utxo账号赋值
  let utxoAccount: any = defaultUTXOAccount;
  utxoAccount['utxoAddressTest'] = data.utxoAddressTest;
  utxoAccount['address'] = data.utxoAddressMain;
  utxoAccount['keyStore'] = data.keyStore;
  utxoAccount['NoIndex'] = index;
  utxoAccount['userName'] = 'Wallt' + (index > 10 ? '' : '0') + index;
  indexDbData.getData('UTXO').then((res: any) => {
    res['NoIndex'] = index;
    Object.keys(res.content).forEach((item) => {
      res.content[item]['NoIndex'] = index;
      res.content[item].walltInfo.push(utxoAccount);
    });
    indexDbData.putData(res);
  });
  appendRecCurrent(utxoAccount);
};
// 添加数据到当前选中和rec网络
const appendRecCurrent = (content: any) => {
  indexDbData.getData('rpc_url').then((res: any) => {
    // 只有新增的网络和rec网络一致才添加
    if (res.netWorkType.toLowerCase() == content.netWorkType.toLowerCase()) {
      res['NoIndex'] = res['NoIndex'] + 1;
      res.walltInfo.push(content);
      // 保存key
      indexDbData.putData(res);
      indexDbData.getData('currentWalltAddress').then((res: any) => {
        // 存为当前选中的网络中数据
        let contentRecCurrent = content;
        contentRecCurrent['id'] = 'currentWalltAddress';
        indexDbData.putData(contentRecCurrent);
      });
    }
    // if (res.netWorkType.toLowerCase() == 'evm') {
    //   res['NoIndex'] = res['NoIndex'] + 1;
    //   res.walltInfo.push(content);
    //   // 保存key
    //   indexDbData.putData(res);

    //   indexDbData.getData('currentWalltAddress').then((res: any) => {
    //     // 存为当前选中的网络中数据
    //     let contentRecCurrent = content;
    //     contentRecCurrent['id'] = 'currentWalltAddress';
    //     indexDbData.putData(contentRecCurrent);
    //   });
    // }
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
  let dbData = data.filter((item: any) => {
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
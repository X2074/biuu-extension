<template src='./index.html'></template>
<style scoped lang='scss'>
@import './index.scss';
</style>
<script lang="ts" >
export default {
  name: 'nftDetail'
};
</script>
<script lang='ts' setup>
import { ref, onMounted, defineProps, toRaw, watch } from 'vue';
import Web3 from 'web3';
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus.js';
import { Decrypt } from '@/utils/index';
import { evmKey, isAddress } from '@/utils/EVM/index';
import { computeNftGas, NFTTransfer } from '@/utils/nft.js';
import { NFTUpdataIndexDB, hashSaveIndexDB, usedToHaveNft } from '@/utils/operateIndexDB.js';
import md5 from 'js-md5';
import store from '@/store';
let loading = ref(false);
let loadingText = ref('发送中...');
let detailContentStatus = ref('detail');
const props = defineProps(['details']);
let nftSelect = ref(false); //是否显示nft的下拉
let gasPrice: any = ref(0);
let currentWallt: any = ref(null); //当前用户信息
let passKey = ref(''); //密码
let passKeyModel = ref(''); //输入框密码
let rpcData: any = ref(null); //rpc信息
let privateKey: any = ref(null); //私钥
let gasPriceTeade = ref(0); //交易时候需要的gas费
let transferAddress = ref('0x533f6FEcE8aF41da6c41de7aF13D289bA92f9fE9');
let nftContent: any = ref(null); //nft详情数据
let nftList: any = ref(null); //nft列表
let checkNft = ref(null);
onMounted(async () => {
  let nftDetail: any = store.state.nftDetail;
  nftContent.value = nftDetail['detail'];
  nftList.value = nftDetail['list'];

  indexDbData.getData('rpc_url').then((res: any) => {
    rpcData.value = res;
  });
  // 获取设置的密码
  indexDbData.getData(md5('secret')).then((res: any) => {
    passKey.value = res.secret;
  });
  currentWallt.value = await indexDbData.getData('currentWalltAddress');
  checkNft.value = nftContent.value;
  console.log(props, 'props');
});
// 返回上一页面
const toBack = () => {
  bus.emit('nextPage', '');
};
// 删除nft
const deleteNft = async () => {
  await deleteUpdata(currentWallt.value, 'delete');
  await toBack();
};
// 选中的nft
const checkAddress = (res: any) => {
  checkNft.value = res;
  nftSelect.value = false;
};

const onCopy = () => {
  navigator.clipboard.writeText(nftContent.value.nftAddress);
  bus.emit('promptModalSuccess', '复制成功');
};
watch(transferAddress, (newV) => {
  isAddress(newV).then((res: any) => {
    if (!res) {
      bus.emit('promptModalErr', '钱包地址不合法');
    } else {
      if (newV == currentWallt.value.address) {
        bus.emit('promptModalErr', '不能使用当前用户地址');
        return;
      }
      loading.value = true;
      let data = {
        contractAddress: nftContent.value.nftAddress,
        accountAddress: currentWallt.value.address,
        receiverAddress: newV,
        tokenId: nftContent.value.tokenId
      };
      computeNftGas(data).then((res: any) => {
        console.log(res, 'res');
        gasPriceTeade.value = res ? res : 300000;
        getWei(res ? res : 300000);
      });
    }
  });
});

const getWei = async (balance: any) => {
  // 定义rpc
  let web3 = new Web3(new Web3.providers.HttpProvider(rpcData.value.url));
  let price = web3.utils.fromWei(balance + '', 'ether');
  console.log(price, 'balance');
  gasPrice.value = price;
  loading.value = false;
};
// 交易nft
const tradeNft = async (key: string) => {
  let data = {
    contractAddress: nftContent.value.nftAddress,
    accountAddress: currentWallt.value.address,
    receiverAddress: transferAddress.value,
    tokenId: nftContent.value.tokenId,
    gas: gasPriceTeade.value,
    key: key
  };
  // 获取交易hash
  let hash = await NFTTransfer(data);
  // 交易hash的保存
  await hashSaveIndexDB(currentWallt.value['keyStore'], 'dispose', hash);
  // 删除当前nft并保存该数据到曾经拥有nft模块
  await deleteUpdata(checkNft.value, 'tread');
};

// 确认密码
const confirmPsd = async () => {
  if (!passKeyModel.value) {
    bus.emit('promptModalErr', '请输入密码');
    return;
  }
  if (md5(passKeyModel.value) != passKey.value) {
    bus.emit('promptModalErr', '您输入的密码有误');
    return;
  }
  loading.value = true;
  // 获取当前的助记词
  let data = await indexDbData.getData('keyStore');
  console.log(data, 'data');
  let key = data.secret[currentWallt.value.keyStore];
  // 如果账户是私钥导入的，就直接赋值私钥
  if (currentWallt.value['keyStoreType'] == 'privateKey') {
    let encryption = await Decrypt(key, passKey.value);
    privateKey.value = encryption;
    tradeNft(privateKey.value);
    return;
  }
  console.log(key, 'key');
  // 解密助记词
  let encryption = await Decrypt(key, passKey.value);
  console.log(encryption, 'encryption');
  // 只有evm有nft交易
  evmKey(encryption).then((keys: any) => {
    loading.value = false;
    //此处应该判断是evm还是utxo
    privateKey.value = keys.privateKey;
    tradeNft(privateKey.value);
  });
};
// 删除或者是交易nft
const deleteUpdata = async (content: any, type: string) => {
  let data;
  if (!nftList.value || (nftList.value && nftList.value.length == 1)) {
    data = [];
  } else {
    data = nftList.value.filter((item: any) => {
      return item.tokenURI != content['tokenURI'];
    });
  }
  await NFTUpdataIndexDB(currentWallt.value['keyStore'], content['nftAddress'], toRaw(data));
  // 删除image（nft的base64数据）
  let { image, prompt_id, ...nftContent } = toRaw(content);
  console.log(image, 'image', prompt_id, 'prompt_id', nftContent);

  if (type == 'tread') {
    //如果是交易
    await usedToHaveNft(nftContent, currentWallt.value['keyStore']);
  }
  return true;
};
</script>
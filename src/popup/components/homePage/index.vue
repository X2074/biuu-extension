<template src='./index.html'></template>
<script lang="ts" >
export default {
  name: 'homePage'
};
</script>
<script lang='ts' setup>
import { ref, onMounted, defineProps, toRaw } from 'vue';
import bus from '@/utils/bus.js';
import indexDbData from '@/utils/indexDB.js';
import Web3 from 'web3';
import selectAccount from '@/components/popup/homePage/selectAccount/index/index.vue';
import setting from '@/components/popup/homePage/setting/index.vue';
import networkSwitching from '@/components/popup/homePage/networkSwitching/index.vue';
import importNfts from '@/components/popup/homePage/nfts/importNfts/index.vue';
import nftDetail from '@/components/popup/homePage/nfts/nftDetail/index.vue';
import transactionHistory from '@/components/popup/homePage/transactionHistory/index.vue';
import sendTrade from '@/components/popup/homePage/sendTrade/index.vue';
// import transfer from "@/components/popup/homePage/transfer/index.vue"
// 底部card部分
import nftCard from '@/components/popup/homePage/nfts/nftsCard/index.vue';
const transactionHash = ref(0);
const moreShow = ref(false);
const props = defineProps(['walltContent']);
const web3 = ref();
let walltContent: any = ref(null);
const netWorkList: any = ref([]); //下拉列表的网络数据
const netWorkType = ref('EVM'); //网络类型
const walltEnvironment = ref({}); //钱包所在的网络
const walltAccount = ref('nfts');
const pageType = ref(''); //当前需要展示的页面
let loading = ref(true);
let nftDetails = ref(null);
onMounted(() => {
  initialize();
});
// 初始化
const initialize = async () => {
  console.log('initialize');

  let data = await indexDbData.getData('rpc_url');
  if (!data) {
    netWorkChange('EVM');
  } else {
    // 是否有选中的模式
    await netWorkChange(data.netType ? data.netType : 'EVM');
    walltEnvironment.value = data;
    // 定义rpc
    web3.value = new Web3(new Web3.providers.HttpProvider(data.url));
    await getHash();
    loading.value = false;
  }
};
// 交易hash
const getHash = () => {
  walltContent.value = toRaw(props.walltContent);
  if (!walltContent.value || !walltContent.value.txHash) return;
  if (walltContent.value.txHash && walltContent.value.txHash.length > 1) {
    let index = walltContent.value.txHash.length - 1;
    let txHash = walltContent.value.txHash[index];
    toWei(txHash);
  } else {
    if (!walltContent.value.txHash) return;
    let txHash = walltContent.value.txHash[0];
    toWei(txHash);
  }
};
const onCopy = () => {
  navigator.clipboard.writeText(props.walltContent.address);
  bus.emit('promptModalSuccess', '复制成功');
};
const refresh = () => {
  location.reload();
};
// wei转币
const toWei = (data: any) => {
  console.log(web3.value, 'sadsadsadsad');

  if (!data) return;
  web3.value.eth.getTransaction(data.transactionHash).then((res: any) => {
    if (!res) return;
    transactionHash.value = web3.value.utils.fromWei(res.value, 'ether');
  });
};
const toPage = (res: any) => {
  moreShow.value = !moreShow.value;
  pageType.value = 'showKey';
  walltAccount.value = 'selectAccount';
};

// 当前网络数据
const netWorkChange = (type: any) => {
  netWorkType.value = type;
  indexDbData.getData(type).then((res: any) => {
    let data = Object.values(res.content);
    netWorkList.value = data;
    console.log(netWorkList.value, 'netWorkList.value');
  });
};
bus.on('closeMore', () => {
  moreShow.value = false;
});
// homepage模块里面的返回按钮
bus.on('homePageBack', (res: any) => {
  loading.value = true;
  walltAccount.value = res.page || 'nfts';
  console.log(res, '跳转nft详情');

  if (res && res.data && res.page == 'nftDetail') {
    //nft详情需要的数据
    nftDetails.value = res.data;
  } else {
    initialize();
  }
});
</script>
<style lang="scss">
@import './index.scss';
</style>
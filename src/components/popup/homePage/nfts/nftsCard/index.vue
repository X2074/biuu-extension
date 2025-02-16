<template src='./index.html'></template>
<script lang="ts" >
export default {
  name: 'nftCard'
};
</script>
<style scoped lang='scss'>
@import './index.scss';
</style>
<script lang='ts' setup>
import { ref, onMounted, toRaw } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import { getNftBase64 } from '@/utils/nft.js';
import nftDetail from '../nftDetail/index.vue';
import nftImages from './nftImages/index.vue';
import bus from '@/utils/bus';
import md5 from 'js-md5';
let loading = ref(false);
let loadingText = ref('加载中...');
let nftsList: any = ref([]);
let onceNftList = ref([]); //先前拥有的nft
onMounted(async () => {
  let currentWalltAddress = await indexDbData.getData('currentWalltAddress');
  let data = await indexDbData.getData(md5('nfts'));
  if (!data) return;
  let nfts: any = data['content'][currentWalltAddress['keyStore']];
  for (let key in nfts) {
    nftsList.value.push(nfts[key]);
  }
  // 曾经拥有的nft
  let onceNfts = await indexDbData.getData(md5('onceNft'));
  if (
    !onceNfts ||
    !onceNfts['content'][currentWalltAddress['keyStore']] ||
    !onceNfts['content'][currentWalltAddress['keyStore']].length
  )
    return;
  onceNftList.value = onceNfts['content'][currentWalltAddress['keyStore']];
  console.log(onceNftList.value, '曾经的数据');
  // if(nftsContent && nftsContent.length){
  //     fetchAllData(nftsContent).then(res=>{
  //         // nftsList.value = res;
  //     })
  // }
});

const fetchAllData = async (data: any) => {
  let promises: any;
  data.forEach((item: any) => {
    let promise = item['collections'].map((info: string) => getNftBase64(info));
    promises = [...promises, ...promise];
  });

  try {
    const results = await Promise.all(promises);
    console.log('All data received:', results);
    return results;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

const toImport = () => {
  bus.emit('homePageBack', { page: 'importNfts' });
};

const toDetail = (data: any, list: any) => {
  let info = {
    detail: toRaw(data),
    list: toRaw(list)
  };
  bus.emit('homePageBack', {
    page: 'nftDetail',
    data: info
  });
};
</script>
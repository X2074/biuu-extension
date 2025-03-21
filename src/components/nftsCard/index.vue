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
import nftImages from './nftImages/index.vue';
import bus from '@/utils/bus.js';
import md5 from 'js-md5';
let loading = ref(false);
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

const toImport = () => {
  bus.emit('homePageBack', { page: 'importNfts' });
};
</script>
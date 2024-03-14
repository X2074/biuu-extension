<template src='./index.html'></template>
<style scoped lang='scss'>
@import './index.scss';
</style>
<script lang='ts' setup>
import { ref, onMounted, toRaw } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import {getNftBase64} from '@/utils/nft.js';
import nftDetail from "../nftDetail/index.vue"   
import nftImages from "./nftImages/index.vue"   
import bus from '@/utils/bus';
import md5 from 'js-md5';
let loading = ref(false)
let loadingText = ref('加载中...')
let nftsList = ref([]);
onMounted(async ()=>{
	let currentWalltAddress = await indexDbData.getData('currentWalltAddress')
    let data = await indexDbData.getData(md5('nfts'));
    if(!data) return;
    console.log(data,'data');
    
    let nfts = data['content'][currentWalltAddress['keyStore']]
    console.log(nfts);
    for (let key in nfts) {
        nftsList.value.push(nfts[key])
    }
        console.log(nftsList.value);
    // if(nftsContent && nftsContent.length){
    //     fetchAllData(nftsContent).then(res=>{
    //         // nftsList.value = res;
    //     })
    // }
})

const fetchAllData = async (data)=>{
    let promises;
    data.forEach(item=>{
        let promise = item['collections'].map(info=>getNftBase64(info));
        promises = [...promises,...promise]
    })
    
    try {
        const results = await Promise.all(promises);
        console.log('All data received:', results);
        return results;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

const toImport = ()=>{
    bus.emit('homePageBack',{page:'importNfts'})
}

const toDetail = (data,list)=>{
    let info = {
        detail:toRaw(data),
        list:toRaw(list)
    }
    bus.emit('homePageBack',{
        page:'nftDetail',
        data:info
    })
}
</script>
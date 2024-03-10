<template src='./index.html'></template>
<style scoped lang='scss'>
@import './index.scss';
</style>
<script lang='ts' setup>
import { ref, onMounted, reactive, watch } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import {getNftBase64} from '@/utils/nft.js';
import nftDetail from "../nftDetail/index.vue"   
import bus from '@/utils/bus';
let loading = ref(false)
let loadingText = ref('加载中...')
let nftsList = ref(null);
onMounted(async ()=>{
    let data = await indexDbData.getData('currentWalltAddress');
    if(data['nfts'] && data['nfts'].length){
        fetchAllData(data['nfts']).then(res=>{
            nftsList.value = res;
        })
    }
})

const fetchAllData = async (data)=>{
    const promises = data.map(item=>getNftBase64(item))
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
    bus.emit('homePageBack',{
        page:'nftDetail',
        data:{
            detail:data,
            list:list
        }
    })
}
</script>
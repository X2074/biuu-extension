<template src='./index.html'></template>
<style scoped lang='scss'>
@import './index.scss';
</style>
<script lang='ts' setup>
import { ref, onMounted,toRaw } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import {getNftBase64} from '@/utils/nft.js';  
import bus from '@/utils/bus';
import md5 from 'js-md5';
let loading = ref(false)
let loadingText = ref('加载中...')
let nftsList = ref([]);
const props = defineProps(['nftContent'])
onMounted(async ()=>{
    fetchAllData(props['nftContent'])
})

const fetchAllData = async (data)=>{
    data.forEach(item=>{
        getNftBase64(item).then(res=>{
            console.log(res,'测试接口数据');
            nftsList.value.push(res)
        });
    });
}

const toImport = ()=>{
    bus.emit('homePageBack',{page:'importNfts'})
}

const toDetail = (data,list)=>{
    
    let info = {
        detail:toRaw(data),
        list:toRaw(list)
    }
    console.log(info,'详情页数据');
    bus.emit('homePageBack',{
        page:'nftDetail',
        data:info
    })
}
</script>
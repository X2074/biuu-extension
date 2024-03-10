<template src='./index.html'></template>
<style scoped lang='scss'>
@import './index.scss';
</style>
<script lang='ts' setup>
import { ref, onMounted,defineProps, reactive, watch } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus';
import {getNFTContent,NFTSaveIndexDB} from '@/utils/nft.js';
let loading = ref(false)
let loadingText = ref('加载中...')
let detailContentStatus = ref('trade')
let rawData = ref(null);//原始数据
let addressList = ref(null);//显示数据
const props = defineProps(['details'])
let nftSelect = ref(false);//是否显示nft的下拉
let transferAddress = ref('Ox54ahsdafsasfsacsdbdsahufgasfgadhaweh cvhscytjasyafds7323r34')
onMounted(async ()=>{
})
// 返回上一页面
const toBack = ()=>{
    bus.emit('nextPage','');
}
// 删除nft
const deleteNft = ()=>{

}
// 获取通讯录列表
const getAddressList = async ()=>{
    let data = await indexDbData.getData('addressBook');
    if(data){
        rawData.value = data.content;
        addressList.value = data.content;
    }
    loading.value = false;
}
</script>
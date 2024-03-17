
<template src='./index.html'></template>
<style scoped lang='scss'>
@import './index.scss';
</style>
<script lang='ts' setup>
import { ref, onMounted } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus';
import addressBook from '../setting/components/addressBook/index.vue'
let settingStep = ref('options');//设置页面当前展示内容
let currentWallt = ref(null)//当前钱包信息
let rpcData = ref(null)//当前网络信息

let loading = ref(false)
let loadingText = ref('加载中...')
indexDbData.getData('currentWalltAddress').then(res => {
    currentWallt.value = res;
})
indexDbData.getData('rpc_url').then(res => {
    rpcData.value = res;
})
// 返回上一页面
const toBack = (page)=>{
    if(page == 'homePage'){
        bus.emit('nextPage','');
    }else{
        settingStep.value = page;
    }
}
</script>
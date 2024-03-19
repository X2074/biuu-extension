
<template src='./index.html'></template>
<style scoped lang='scss'>
@import './index.scss';
</style>
<script lang='ts' setup>
import { ref, onMounted } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus';
let rpcData = ref(null)//当前网络信息
let toAddress = ref('');//转账地址
indexDbData.getData('rpc_url').then(res => {
    rpcData.value = res;
})
let loading = ref(false)
let loadingText = ref('加载中...')
</script>
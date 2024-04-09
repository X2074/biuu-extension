
<template src='./index.html'></template>
<style scoped lang='scss'>
@import './index.scss';
</style>
<script lang='ts' setup>
import { ref, onMounted } from 'vue';
let rpcList
// 返回上一页面
const toBack = (page)=>{
    if(page == 'homePage'){
        bus.emit('nextPage','');
    }else{
        settingStep.value = page;
    }
}

</script>
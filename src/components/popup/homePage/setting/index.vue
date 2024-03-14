
<template src='./index.html'></template>
<style scoped lang='scss'>
@import './index.scss';
</style>
<script lang='ts' setup>
import { ref, onMounted } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus';
// import privateKey from './components/privateKey/index.vue'
import security from './components/security/index.vue'
import addressBook from './components/addressBook/index.vue'
let settingStep = ref('options');//设置页面当前展示内容
let currentWalltAddress = ref(null)//当前钱包信息

let loading = ref(false)
let loadingText = ref('加载中...')
indexDbData.getData('currentWalltAddress').then(res => {
    currentWalltAddress.value = res;
})
// 返回上一页面
const toBack = (page)=>{
    if(page == 'homePage'){
        bus.emit('nextPage','');
    }else{
        settingStep.value = page;
    }
}

bus.on('settingPage',res=>{
    settingStep.value = res;
})
</script>
<style lang="scss">
.setting {
    .header {
        align-items: center;
        position: relative;
        height: 56px;
        padding: 0 14px;
        padding-left: 40px;
        cursor: pointer;

        img {
            width: 24px;
            height: 24px;
            cursor: pointer;
            position: absolute;
            left: 14px;
            top: 18px;
            cursor: pointer;
        }

        p {
            font-size: 16px;
            cursor: pointer;
        }
    }
}

</style>
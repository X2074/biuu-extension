<template>

<div class="import-wallt">
    <!-- <div class="header flex">
        <img class="back-img" @click="step = step - 1;" src="@/assets/images/icons/back.png" alt="">
        <img class="close-img" @click="step = 0" src="@/assets/images/icons/close.png" alt="">
    </div> -->
    <setPsd v-if="step == 1" />
    <importPhrase v-if="step == 2" />
    <ImportPrivate v-if="step == 3" />
</div>
</template> 
<script lang='ts' setup>
import { ref, onMounted, watchEffect, getCurrentInstance } from 'vue';
import bus from '@/utils/bus.js';
import importPhrase from './importPhrase/index.vue'
import ImportPrivate from './ImportPrivate/index.vue'
import setPsd from './setPsd/index.vue'
import indexDbData from '@/utils/indexDB.js';
import md5 from 'js-md5';
const newPsd = ref('')//钱包密码
const confirmPsd = ref('')//钱包密码
const newPsdBol = ref(false)
const confirmPsdBol = ref(false)
const walltInfo = ref(null)//钱包相关信息
const verifyBol = ref(false)
const step = ref(1);
bus.on('importWalletPage', (res) => {
//     console.log(res,'resresres');
    
    if (res == 'setPsd') step.value = 1;
    if (res == 'createMnemonic') step.value = 2;
    if (res == 'verifyMnemonic') step.value = 3;
//     if (res == 'userContent') {
//         window.location.href = 'userContentPage.html';
//     };
//     // if (res == 'buyPage') {
//     //     window.location.href = 'userContentPage.html';
//     // };
})
</script>
<style lang="scss">
    .import-wallt{
        width:360px;
        padding:18px 16px;
        position: absolute;
        bottom: 0;
        top: 60px;
        .header{
            align-items: center;
            justify-content: space-between;
            img{
                width:24px;
                height:24px;
                cursor: pointer;
            }
        }
        .title {
            font-size: 28px;
            font-weight: 600;
            line-height: 40px;
            color: #000;
        }

        .text {
            font-size: 14px;
            line-height: 22px;
        }
    }
</style>
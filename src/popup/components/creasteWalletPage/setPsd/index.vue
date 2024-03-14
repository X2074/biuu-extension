<template src='./index.html'></template>
<script lang='ts' setup>

import { ref, onMounted } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus.js';
import md5 from 'js-md5';
// 预制网络
import netWork from '@/utils/netWork.json'
import CryptoJS from 'crypto-js'; //引用AES源码js
let mnemonicList = ref([])//助记词数组
let newPsd = ref('')//钱包密码
let confirmPsd = ref('')//钱包密码
let newPsdBol = ref(false)
let confirmPsdBol = ref(false)
let readeTip = ref(false);//是否阅读

// 生成keystory文件
const creatKeyStory = () => {
    newPsdBol.value = false;
    confirmPsdBol.value = false;
    if (!newPsd.value || newPsd.value.length < 8) {
        newPsdBol.value = true;
        confirmPsd.value = '';
        return;
    }
    if (!confirmPsd.value) {
        confirmPsdBol.value = true;
        return;
    }
    if (newPsd.value != confirmPsd.value) {
        confirmPsdBol.value = true;
        return;
    }
    console.log(readeTip.value);
    if(!readeTip.value) return;
    console.log(md5('secret'),md5(newPsd.value));
    
    // 存储密码
    indexDbData.putData({
        id: md5('secret'),
        secret: md5(newPsd.value)
    })
    setTimeout(() => {
        bus.emit('nextCreatePage', 'createMnemonic');
    }, 500)
}

</script>
<style lang='scss'>
@import './index.scss';
</style>
<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, defineProps, nextTick } from 'vue';
import bus from '@/utils/bus.js'; 
import indexDbData from '@/utils/indexDB';
import { Decrypt,evmKey } from '@/utils/index.js';
import {createMnemonic,createWallet} from "@/utils/createUser"
import privateKey from "./components/privateKey/index.vue"
import mnemonicPhrase from "./components/mnemonicPhrase/index.vue"
import revisePassword from "./components/revisePassword/index.vue"
import QRCode from 'qrcodejs2-fix';
import Web3 from 'web3'
import md5 from 'js-md5';
let loading = ref(true)
let loadingText = ref('加载中...')
let passKey = ref('');//密码
let passKeyModel = ref('')//输入框密码
let securityProcess = ref('')//显示那个按钮内容
let currentWalltAddress = ref(null)//当前钱包信息
onMounted(() => {
    indexDbData.getData('currentWalltAddress').then(res => {
        currentWalltAddress.value = res;
    })
    initializeInfo()
})
// 数据初始化 
const initializeInfo = ()=>{
    // 获取设置的密码
	indexDbData.getData(md5('secret')).then(res => {
		passKey.value = res.secret;
	}).catch(err => { })
    loading.value = false;
}


// 复制
const onCopy = (txt) => {
	navigator.clipboard.writeText(txt);
	
    bus.emit('promptModalSuccess','复制成功')
}

// 取消，回到设置页面
const toBack = ()=>{
    bus.emit('settingPage','options')
}
bus.on('securityPage',res=>{
    securityProcess.value = '';
})
</script>
<style lang="scss">
@import "./index.scss";
</style>
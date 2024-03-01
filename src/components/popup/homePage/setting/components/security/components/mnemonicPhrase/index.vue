<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, defineProps, nextTick } from 'vue';
import bus from '@/utils/bus.js'; 
import indexDbData from '@/utils/indexDB';
import { Decrypt } from '@/utils/index.js';
import QRCode from 'qrcodejs2-fix';
import Web3 from 'web3'
import md5 from 'js-md5';
let loading = ref(true)
let loadingText = ref('加载中...')
let nowAccount = ref(null)
let passKey = ref('');//密码
let passKeyModel = ref('')//输入框密码
let qrCodeDiv = ref(null)
const props = defineProps(['address'])
let rpcData = ref(null)
//流程步骤：首页，问题1，问题2，助记词密码，助记词显示
let processSteps = ref('home');
let verificationClick = ref(false)//二次确认按钮长按样式
let verificationTime = ref(null)//一次性计时器
let mnemonicStyle = ref('txt');//助记词展示样式
let mnemonicTxt = ref(true);//文本助记词外层蒙版
// 问题回答的结果
let issueOneOutcome = ref('')
let issueTwoOutcome = ref('')
let encryption = ref(null);//解密后的助记词
// 获取设置的密码
indexDbData.getData('securityConfirmation').then(res => {
    console.log(res,'res');
    // 如果存在说明已经回答过安全问题，不用走流程，直接展示助记词页面
    if(res){
        processSteps.value = "mnemonicPhrase";
    }
}).catch(err => { })
onMounted(() => {
    initializeInfo()
})
// 数据初始化 
const initializeInfo = ()=>{
    // 获取设置的密码
	indexDbData.getData(md5('secret')).then(res => {
		passKey.value = res.secret;
	}).catch(err => { })
    // 获取设置的密码
	indexDbData.getData(md5('secret')).then(res => {
		passKey.value = res.secret;
	}).catch(err => { })
    loading.value = false;
}
// 问题回答完毕，继续下一步
const displayKey = ()=>{
    let data = {
        id:'securityConfirmation',
        content:"true"
    }
    indexDbData.putData(data)
    processSteps.value = 'mnemonicPhrase';
}
// 复制
const onCopy = (txt) => {
	navigator.clipboard.writeText(txt);
    bus.emit('promptModalSuccess','复制成功')
}

// 确认密码
const confirmPsd = async ()=>{
    if(!passKeyModel.value){
        bus.emit('promptModalErr','请输入密码')
        return;
    }
    if(md5(passKeyModel.value) != passKey.value){
        bus.emit('promptModalErr','您输入的密码有误')
        return;
    }
    loading.value = true;
    // 获取当前的助记词
    let data = await indexDbData.getData('keyStore')
    console.log(data,'data');
    let key = await data.secret[props.address];
    console.log(key,'key');
    // 解密助记词
    let mnemonic = await Decrypt(key, passKey.value)
    console.log(mnemonic,'mnemonic');
    encryption.value = mnemonic.split(' ');
    loading.value = false;
    processSteps.value = 'mnemonic';
    console.log(encryption,'encryption');
}
// 长按
const pressAndHold = ()=>{
    if(verificationClick.value) return;
    verificationClick.value = true;
    verificationTime.value = setTimeout(() => {
        clearTimeout(verificationTime.value)
        processSteps.value = 'mnemonic';
    }, 3000);
}
// 取消长按
const pressAndHoldUp = ()=>{
    if(verificationTime.value){//如果计时器还在说明时间不够，就清除
        verificationClick.value = false;
        clearTimeout(verificationTime.value)
    }
}
// 取消，回到设置页面
const toBack = ()=>{
    bus.emit('settingPage','options')
}

const qrCodeShow = ()=>{
    mnemonicStyle.value = 'qrcode';
    new QRCode(qrCodeDiv.value, {
        text: encryption.value.join(' '),
        width: 200,
        height: 200,
        colorDark: "#333333", //二维码颜色
        colorLight: "#ffffff", //二维码背景色
        correctLevel: QRCode.CorrectLevel.L//容错率，L/M/H
    })
}
</script>
<style lang="scss">
@import "./index.scss";
</style>
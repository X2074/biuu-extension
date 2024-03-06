
<template src="./index.html"></template>
<script lang="ts" setup>
import { ref, onMounted, reactive, watch } from 'vue';
const googleId = ref('fkhnghcgmjcgeniccpjpmlfpgbibmmge')
import bus from '@/utils/bus';
const toCreate = (res) => {
    // let createData = {
    //     url:'chrome-extension://kkhfpjkgnkckiofggkkiedpfjknmpemo/walltBackground.html?pageType=create',//打开的网页地址（即'http://www.google.com'，不是'www.google.com'）
    //     left:0,//新视窗相对于屏幕的左边缘的位置的像素值。如果没有指定，那么新的视窗从最后一个    有焦点的视窗自然偏移。
    //     top:0,//新视窗相对于屏幕的上边缘的位置的像素值。如果没有指定，那么新的视窗从最后一个有焦点的视窗自然偏移。
    //     width:560,//新视窗的像素宽度。如果没有指定，默认为自然宽度。
    //     height:500,//新视窗的像素高度。如果没有指定，默认为自然高度。
    //     type:"popup",// ( optional enumerated string ["normal", "popup"]可选，枚举字符串["normal", "popup"] ) 指定新建浏览器视窗的类型。
    //   }
    //   //打开一个浏览器
    //   chrome.windows.create(createData, ()=>{
    //     window.close();
    //     console.log('打开新页面')
    //   })
    bus.emit('nextPage',res)
    // if (!googleId.value) return;
    // localStorage.setItem('googleId', googleId.value)
    // window.open('chrome-extension://' + googleId.value + '/components/creasteWalletPage/index.html')
}
</script>
<style lang="scss">
@import "./index.scss";
</style>
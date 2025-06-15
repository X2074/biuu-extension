<style lang="scss" scoped>
@import './index.scss';
</style>
<template src="./index.html"></template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, toRaw } from 'vue';
import indexDbData from '@/utils/indexDB';
import store from '@/store';
import md5 from 'js-md5';
import { ethers } from 'ethers';
const message = ref('');
const address = ref('');
const origin = ref('');
let passKey = ref('');
let privateKey: any = ref(null);
let authorization: any = ref({});
let watchAsset:any = ref({
    image:'',
    symbol:'',
    balance:''
})
onMounted(async () => {
   let data:any = await indexDbData.getData('wallet_watchAsset') || {};
   console.log(data,"data");
   watchAsset.value = data.data;
});
const reject = () => {
    let data: any = { action: 'watch_asset_response', error: 'User rejected the request' };
    chrome.runtime.sendMessage(data, (response: any) => {
        console.log(response, 'response');
        window.close();
    });
};

const confirm = ()=>{
    let data: any = { action: 'watch_asset_response', result: true };
    chrome.runtime.sendMessage(data, (response: any) => {
        console.log(response, 'response');
        window.close();
    });
}

</script>

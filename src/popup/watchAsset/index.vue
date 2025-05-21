<style lang="scss" scoped>
@import './index.scss';
</style>
<template src="./index.html"></template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, toRaw } from 'vue';
import indexDbData from '@/utils/indexDB';
import bus from '@/utils/bus.js';
import erp721 from '@/utils/erp721.json';
import {TokenService} from '@/utils/tokenService';
import {changeAssetIndexDB} from '@/utils/request/EVM/watchAsset';
import md5 from 'js-md5';
import Web3 from 'web3';
import { useRouter, useRoute } from 'vue-router';
let loadingText = ref('加载中...');
let loading = ref(false)
let router = useRouter();
const message = ref('');
const storedNetworks:any = ref(null);
let currentAddress:any = ref(null);
const origin = ref('');
let address = ref('');
let symbol: any = ref('');
let decimals: any = ref(0);
let authorization: any = ref({});
const web3 = ref<Web3 | null>(null);
onMounted(async () => {
    // 获取当前网络作为默认值
    storedNetworks.value = await indexDbData.getData('rpc_url');
    currentAddress.value = await indexDbData.getData('currentWalltAddress');
});

const watchAsset = async () => {
    loading.value = false;
    var regeEn = /^[a-zA-Z0-9]*$/;
    var regeNumber = /^[0-9]*$/;
    if (!address.value) {
        bus.emit('promptModalErr', '请输入代币地址');
        return;
    }
    if (!Web3.utils.isAddress(address.value)) {
        bus.emit('promptModalErr', '无效的代币地址，请再试一次。');
        return;
    }
    if (!symbol.value) {
        bus.emit('promptModalErr', '请输入代币符号');
        return;
    }
    if (!/^[A-Z]+$/.test(symbol.value)) {
        bus.emit('promptModalErr', '代币符号必须是大写字母');
        return;
    }
    if (!regeNumber.test(decimals.value)) {
        bus.emit('promptModalErr', '无效的代币小数，请再试一次。');
        return;
    }
    // 验证小数
    if (!decimals.value) {
        bus.emit('promptModalErr', '请输入代币小数位数');
        return;
    } 
    if (parseInt(decimals.value) < 0 || parseInt(decimals.value) > 18) {
        bus.emit('promptModalErr', '小数位数必须在0-18之间');
        return;
    }
    loading.value = true;
    // 初始化 Web3
    const web3:any = new Web3(new Web3.providers.HttpProvider(storedNetworks.value['url']));
    const tokenService = new TokenService(web3.currentProvider);// 检测合约类型
    try {
        // 获取余额
        const balanceInfo = await tokenService.getTokenBalance(address.value, currentAddress.value['address']);
        console.log('Balance Info:', balanceInfo);
        changeIndexDB(balanceInfo)
        loading.value = false;
    } catch (error) {
        bus.emit('promptModalErr', '代币信息有误');
        loading.value = false;
    }            
};
    

const reject = ()=>{
    router.push('/homePage');
}

// 更新缓存数据
const changeIndexDB = async (balance:any) => {
        let data = {
            type: balance.type,
            decimals: decimals.value,
            symbol: symbol.value,
            balance: balance.balance,
            address: address.value,
        }
        changeAssetIndexDB(data,address.value)
}
</script>

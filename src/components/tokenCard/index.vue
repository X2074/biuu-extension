<template src="./index.html"></template>
<script lang="ts">
export default {
    name: 'tokenCard'
};
</script>
<style scoped lang="scss">
@import './index.scss';
</style>
<script lang="ts" setup>
import { ref, onMounted, toRaw } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import { getBalance } from '@/utils/index';
import bus from '@/utils/bus.js';
import md5 from 'js-md5';
import {TokenService} from '@/utils/tokenService';
import Web3 from 'web3';
let loading = ref(false);
let userAddress = ref(null);
let walltContent: any = ref(null);
let currentWallt = ref(null);
let tokenList: any = ref([]);
const storedNetworks:any = ref(null);
let currentAddress:any = ref(null);
const web3 = ref<Web3 | null>(null);
onMounted(async () => {
    // 获取当前网络作为默认值
    storedNetworks.value = await indexDbData.getData('rpc_url');
    currentAddress.value = await indexDbData.getData('currentWalltAddress');
    getInfo();
});
// 获取当前账户相关信息
const getInfo = () => {
    // 如果有当前用户信息，说明已经是生成钱包啦
    indexDbData
        .getData('currentWalltAddress')
        .then((res: any) => {
            console.log(res, 'res');
            if (!res) {
                loading.value = false;
                return;
            }
            if (res && res.address) {
                userAddress.value = res.utxoAddressTest || res.address;
                currentWallt.value = res;
                getBalanceInfo();
            } else {
                loading.value = false;
            }
        })
        .catch(() => {
            loading.value = false;
        });
};
const getBalanceInfo = async () => {
    try {
        let data = await indexDbData.getData('rpc_url');
        walltContent.value = JSON.parse(JSON.stringify(data));
        // 钱包地址
        walltContent.value.address = userAddress.value;
        walltContent.value.balance = await getBalance(
            data.url,
            Object.assign({ netWorkType: data.netWorkType }, currentWallt.value)
        );
        delete walltContent.value.walltInfo;
        walltContent.value;
        let assets = data.walltInfo.filter((res:any)=>{
			return res.address == userAddress.value;
		})
		console.log(assets[0].asset,"assets");
		
        tokenList.value.push(toRaw(walltContent.value));
		tokenList.value = [...tokenList.value,...assets[0].asset]
        loading.value = false;
        getAssetBlance()
    } catch (error) {
        loading.value = false;
    }
};
const toImport = () => {
    bus.emit('homePageBack', { page: 'watchAsset' });
};

const getAssetBlance = async ()=>{
    // 初始化 Web3
    const web3:any = new Web3(new Web3.providers.HttpProvider(storedNetworks.value['url']));
    const tokenService = new TokenService(web3.currentProvider);// 检测合约类型
    for (let i = 0; i < tokenList.value.length; i++) {
        if(tokenList.value[i].type){
        const balanceInfo = await tokenService.getTokenBalance(tokenList.value[i].address, currentAddress.value['address']);
            console.log(balanceInfo,"balanceInfo");
            tokenList.value[i].balance = balanceInfo.balance;
        }
    }
}
</script>

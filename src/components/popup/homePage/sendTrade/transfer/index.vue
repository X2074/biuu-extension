
<template src='./index.html'></template>
<style scoped lang='scss'>
@import './index.scss';
</style>
<script lang='ts' setup>
import { ref, onMounted, defineProps, toRaw } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus';
import {evmTransfer } from '@/utils/EVM/index.js';
import web3Operate from '@/background/web3Operate.js';
import {hashSaveIndexDB} from '@/utils/operateIndexDB.js';
import { v4 as uuidv4 } from 'uuid';
import Web3 from 'web3'
let rpcData = ref(null)//当前网络信息
let toAddress = ref('');//转账地址
let gasPrice = ref(0)
let totalPrice = ref(0);//合计
let currentWallt = ref(null);//当前用户信息
let loading = ref(true)
let loadingText = ref('交易处理中...')
let transferContent = ref(
    {
        value:'0',
        sendAddress:''
    }
);
//转账信息
let prop = defineProps(['transferContent']);
onMounted(async ()=>{
    rpcData.value = await indexDbData.getData('rpc_url');
	currentWallt.value = await indexDbData.getData('currentWalltAddress');
    console.log(prop,'prop');
    transferContent.value = prop.transferContent;
    if(rpcData.value['netWorkType'] == 'evm'){
        getWei(transferContent.value['gasPrice'])
    }else{
        let num = Math.ceil(transferContent.value['value'] / 1024);
        gasPrice.value = num * 0.0002;
        totalPrice.value = (transferContent.value['value']*1) + gasPrice.value * 1;
        loading.value = false;
    }
})


const getWei = async (balance)=>{
    // 定义rpc
    let web3 = new Web3(new Web3.providers.HttpProvider(rpcData.value.url));
    let price = web3.utils.fromWei(balance+'', 'ether');
    gasPrice.value = price;
    console.log(transferContent.value['value']*1,"transferContent.value['value']");
    totalPrice.value = (transferContent.value['value']*1) + gasPrice.value * 1;
    loading.value = false;
}
// 取消
const toBack = ()=>{
    bus.emit('sendTradeBack')
}
// 下一步转账
const nextTransfer = async ()=>{
    loading.value = true;
    if(totalPrice.value >= transferContent.value['blance']){
        bus.emit('promptModalErr','您的余额不足')
        return;
    }
    // 发送消息给 background 页面请求数据
    let data;
    if(rpcData.value['netWorkType'] == 'evm'){
        data = Object.assign({uuid:uuidv4(),action:'transferEVM',keyStore:currentWallt.value['keyStore'],accountAddress:currentWallt.value['address']},toRaw(transferContent.value))
    }else{
        data = Object.assign({uuid:uuidv4(),action:'transferUTXO',keyStore:currentWallt.value['keyStore'],accountAddress:currentWallt.value['utxoAddressTest']},toRaw(transferContent.value))
        loading.value = false;
    }
    console.log(data,'utxo的交易数据');
    
	chrome.runtime.sendMessage(data, (response) => {
		console.log('Received data from background:', response);
        hashSaveIndexDB(currentWallt.value['keyStore'],'queue',data)
        setTimeout(()=>{
            loading.value = false;
            bus.emit('nextPage','');
        },3000)
	});
}
</script>
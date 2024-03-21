
<template src='./index.html'></template>
<style scoped lang='scss'>
@import './index.scss';
</style>
<script lang='ts' setup>
import { ref, onMounted, defineProps, toRaw } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus';
import { evmTransfer } from '@/utils/index';
import {hashSaveIndexDB} from '@/utils/operateIndexDB.js';
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
);//转账信息
let prop = defineProps(['transferContent']);
onMounted(async ()=>{
    rpcData.value = await indexDbData.getData('rpc_url');
	currentWallt.value = await indexDbData.getData('currentWalltAddress');
    console.log(prop,'prop');
    transferContent.value = prop.transferContent;
    getWei(transferContent.value['gasPrice'])
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
    // 发送消息给 background 页面请求数据
    let data = Object.assign({action:'transferEVM',keyStore:currentWallt.value['keyStore']},toRaw(transferContent.value))
	chrome.runtime.sendMessage(data, (response) => {
		console.log('Received data from background:', response);
        // hashSaveIndexDB(currentWallt.value['keyStore'],'queue',data)
        loading.value = false;
        bus.emit('nextPage','');
	});
    return;
    // 获取交易hash
    // let hash = await evmTransfer(toRaw(transferContent.value));
    // console.log(hash,'hash');
    
    // if(hash.errBol){
    //     loading.value = false;
    //     bus.emit('promptModalErr',hash.error.message)
    // }else{
    //     console.log(hash,"responseText ");
    //     bus.emit('promptModalSuccess','转账成功')
    //     hash['price'] = transferContent.value['value'];//添加转账数量
    //     // 交易hash的保存
    //     await hashSaveIndexDB(currentWallt.value['keyStore'],'queue',hash)
    //     loading.value = false;  
    //     bus.emit('sendTradeBack')
    // }
}
</script>
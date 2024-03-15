<template src='./index.html'></template>
<style scoped lang='scss'>
@import './index.scss';
</style>
<script lang='ts' setup>
import { ref, onMounted,toRaw } from 'vue';
import indexDbData from '@/utils/indexDB.js'; 
import bus from '@/utils/bus';
import md5 from 'js-md5';
import queueFinish from "./queueFinish/index.vue"
import Web3 from 'web3'
import dayjs from "dayjs";
let loading = ref(false)
let loadingText = ref('加载中...')
let transaction = ref('queue');//交易状态
let transactionContent = ref(null); 
let finishTransactions = ref([]);//成功的交易
let queueTransactions = ref([]);//进行中的交易
let web3 = ref(null)

let currentWallt = ref(null)//当前钱包信息
let rpc_url = ref(null)//当前网络
let rawData = ref(null)
let transactionPage = ref('list');//当前展示页面
// 详情页
let gasPrice = ref(0)
let time = ref(null)
let detailTransaction = ref(null);
onMounted(async ()=>{
    currentWallt.value = await indexDbData.getData('currentWalltAddress')
    rpc_url.value = await indexDbData.getData('rpc_url')
	// 定义rpc;
	web3.value = new Web3(new Web3.providers.HttpProvider(rpc_url.value.url));
    let data = await indexDbData.getData(md5('tradeHash')); 
    if(data){
        rawData.value = data;
        console.log(data['content'],currentWallt.value);
        transactionClassify(data['content'][currentWallt.value['keyStore']])
    }
})
// 对交易数据进行分类
const transactionClassify = (data)=>{;
    data.forEach(item => {
        if(item.status == 'finish')finishTransactions.value.push(item);
        if(item.status == 'queue')queueTransactions.value.push(item);
    });
    loading.value = false;
}
// 更新交易状态
bus.on('transactionStatusUpdates',data=>{
    loading.value = true;
    // 获取当前账户下面的交易数据
    let transaction = rawData.value['content'][currentWallt.value['keyStore']];
    rawData.value['content'][currentWallt.value['keyStore']] = transaction.map(item=>{
        if(item.transactionHash == data['transactionHash']){
            item.status = data['status'];
        }
        return toRaw(item);
    })
    console.log(data,'需要更新的数据',toRaw(rawData.value))
    indexDbData.putData(toRaw(rawData.value));
    queueTransactions.value = [];
    finishTransactions.value = [];
    transactionClassify(rawData.value['content'][currentWallt.value['keyStore']])
})

const toDetail = async (data)=>{
    loading.value = true;
    detailTransaction.value = data;
    await getTransactionStatus(data)
    await getWei(data.gasUsed)
    if(!data['time']){ 
        await getWei(data.gasUsed)
    }else{
            time.value = data['time'];
    }
    transactionPage.value = 'detail';
    loading.value = false;
}
// 查询交易详情
const getTransactionStatus = (data)=>{
    web3.value.eth.getTransactionReceipt(data.transactionHash, (error, receipt) => {
        if (!error) {
            console.log('Transaction status for transaction', receipt);
        }
    });
}
// gas转换
const getWei = async (balance)=>{
    // 定义rpc
    let web3 = new Web3(new Web3.providers.HttpProvider(rpc_url.value.url));
    let price = web3.utils.fromWei(balance+'', 'ether');
    console.log(price,'balance');
    gasPrice.value = price;
}
// 时间转换
const getTime = ()=>{
    web3.value.eth.getBlock(transactionDetail.value.blockNumber, (error, block) => {
        if (!error) {
            const timestamp = block.timestamp;
            time.value = new Date(timestamp * 1000);
            console.log('Transaction timestamp:', new Date(timestamp * 1000)); // 将时间戳转换为可读的时间格式
        }
    });
}
const onCopy = (text,name) => {
	navigator.clipboard.writeText(text);
    let title = name + '复制成功';
    bus.emit('promptModalSuccess',title)
}
</script>
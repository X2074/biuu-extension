<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted,defineProps, toRaw } from 'vue';
import indexDbData from '@/utils/indexDB.js'; 
import Web3 from 'web3'
import bus from '@/utils/bus';
import md5 from 'js-md5';
import dayjs from "dayjs";
const props = defineProps(['transactionContent'])
let web3 = ref(null)
let transactionDetail = ref(null)
let timer = ref(null)
let rpc_url = ref(null)
onMounted(async ()=>{
    console.log(props,'交易');
    transactionDetail.value = toRaw(props.transactionContent);
	console.log(transactionDetail.value, 'transactionDetail.value');
	rpc_url.value = await indexDbData.getData('rpc_url');
	// 定义rpc;
	web3.value = new Web3(new Web3.providers.HttpProvider(rpc_url.value.url));
    await getTime()
    if(transactionDetail.value['status'] == 'queue'){
        await getTransactionStatus()
    }
})
const getTime = ()=>{
    web3.value.eth.getBlock(transactionDetail.value.blockNumber, (error, block) => {
        if (!error) {
            const timestamp = block.timestamp;
            transactionDetail.value['time'] = new Date(timestamp * 1000);
            console.log('Transaction timestamp:', new Date(timestamp * 1000)); // 将时间戳转换为可读的时间格式
        }
    });
}
// 查询交易状态
const getTransactionStatus = ()=>{
    if(timer.value)clearTimeout(timer.value)
    web3.value.eth.getTransactionReceipt(transactionDetail.value.transactionHash, (error, receipt) => {
        // if (!error) {
            console.log('Transaction status for transaction', receipt);
        // }
        if(error || !receipt.status){
            timer.value = setTimeout(() => {
                getTransactionStatus()
            }, 5000);
        }else{
            if(timer.value)clearTimeout(timer.value);
            transactionDetail.value['status'] = 'finish';
            bus.emit('transactionStatusUpdates',transactionDetail.value)
        }
    });
}
</script>
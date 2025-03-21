<template src='./index.html'></template>
<script lang="ts" >
export default {
  name: 'queueFinish'
};
</script>
<script lang='ts' setup>
import { ref, onMounted, defineProps, toRaw } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import Web3 from 'web3';
import bus from '@/utils/bus.js';
import dayjs from 'dayjs';
import { getUtxoHash } from '@/utils/UTXO/meerRpc.js';
const props = defineProps(['transactionContent']);
let web3: any = ref(null);
let transactionDetail: any = ref(null);
let timer: any = ref(null);
let rpc_url: any = ref(null);
onMounted(async () => {
  console.log(props, '交易');
  let detail = toRaw(props.transactionContent);
  if (!detail['status']) detail['status'] = 'dispose';
  transactionDetail.value = detail;
  console.log(transactionDetail.value, 'transactionDetail.value');
  rpc_url.value = await indexDbData.getData('rpc_url');
  if (transactionDetail.value['action'] && transactionDetail.value['action'] == 'transferEVM') {
    // 定义rpc;
    web3.value = new Web3(new Web3.providers.HttpProvider(rpc_url.value.url));
    if (transactionDetail.value.blockNumber) {
      await getTime();
    }
    if (transactionDetail.value['status'] == 'dispose') {
      await evmHash();
    }
  } else if (transactionDetail.value['action'] && transactionDetail.value['action'] == 'transferUTXO') {
    utxoHash();
  }
});
const getTime = () => {
  web3.value.eth.getBlock(transactionDetail.value.blockNumber, (error: any, block: any) => {
    if (!error) {
      const timestamp = block.timestamp;
      transactionDetail.value['time'] = new Date(timestamp * 1000);
      console.log('Transaction timestamp:', new Date(timestamp * 1000)); // 将时间戳转换为可读的时间格式
    }
  });
};
// 查询交易状态
const utxoHash = async () => {
  console.log('utxo交易hash001');
  if (!transactionDetail.value['transactionHash']) {
    transactionDetail.value['status'] = 'finish';
    return;
  }
  console.log('utxo交易hash01');
  let receipt = await getUtxoHash(transactionDetail.value['url'], transactionDetail.value['transactionHash']);
  if (receipt && !receipt.vout) {
    timer.value = setTimeout(() => {
      utxoHash();
    }, 5000);
  } else {
    if (timer.value) clearTimeout(timer.value);
    transactionDetail.value['status'] = 'finish';
    bus.emit('transactionStatusUpdates', transactionDetail.value);
  }
};
const evmHash = () => {
  web3.value.eth.getTransactionReceipt(transactionDetail.value.transactionHash, (error: any, receipt: any) => {
    console.log('Transaction status for transaction', receipt);
    if (error || !receipt.status) {
      timer.value = setTimeout(() => {
        evmHash();
      }, 5000);
    } else {
      if (timer.value) clearTimeout(timer.value);
      transactionDetail.value['status'] = 'finish';
      bus.emit('transactionStatusUpdates', transactionDetail.value);
    }
  });
};
</script>
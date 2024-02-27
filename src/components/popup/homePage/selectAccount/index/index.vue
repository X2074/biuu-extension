<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, defineProps, nextTick } from 'vue';
import bus from '@/utils/bus.js';
import indexDbData from '@/utils/indexDB';
import Web3 from 'web3'
let step = ref('accountList');//当前所在的页
let accountList = ref([]);
let nowAccount = ref(null)
let accountContent = ref(null)

let loading = ref(false)
let loadingText = ref('加载中...')
onMounted(() => {
    // 存为当前展示的钱包数据
    indexDbData.getData('currentWalltAddress').then(res => {
        nowAccount.value = res;
    })
    indexDbData.getData('rpc_url').then(res => {
        console.log(res,'res');
        if (res && res.content) {
            accountContent.value = res.content;
            // 指定钱包单位
            accountList.value = res.content.walltInfo;
            getBlances(res.content)
        }
    }).catch(err=>{})
})

const getBlances = async (data)=>{
    // 定义rpc
    let web3 = new Web3(new Web3.providers.HttpProvider(data.url));
    for (let i = 0; i < accountList.value.length; i++) {
        let balance = await web3.eth.getBalance(accountList.value[i]['address']);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = String(balance).replace(/^(.*\..{4}).*$/, '$1');
        accountList.value[i]['balance'] = balance;
    }
}
</script>
<style lang="scss">
@import "./index.scss";
</style>
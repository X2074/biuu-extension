
<template src='./index.html'></template>
<style scoped lang='scss'>
@import './index.scss';
</style>
<script lang='ts' setup>
import { ref, onMounted, reactive, watch } from 'vue';
import { getCookie, setCookie, clearAllCookie } from '@/utils/index.js';
import indexDbData from '@/utils/indexDB.js';

const walltEnvironment = ref('mainnet')//钱包所在的环境
const rpcChange = (res) => {
	if (res == 'test') {
		indexDbData.putData({
			id: 'rpc_url',
			unit: 'BNB',
			CHAIN_ID: 97,
			url: 'https://data-seed-prebsc-1-s2.binance.org:8545/'
		})
	} else if (res == 'mainnet') {
		indexDbData.putData({
			id: 'rpc_url',
			unit: 'ETH',
			CHAIN_ID: 1,
			url: 'https://bsc-dataseed1.ninicoin.io'
		})
	} else if (res == 'Qitmeer') {
		indexDbData.putData({
			id: 'rpc_url',
			unit: 'Meer',
			CHAIN_ID: 223,
			url: 'http://120.79.90.24:18545'
		})
	}
	location.reload()
}
</script>
<template src='./index/index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, watchEffect, getCurrentInstance } from 'vue';
import { getCookie, setCookie, getQueryParams } from '../../../utils/index';
import indexDbData from '../../../utils/indexDB';
import Web3 from 'web3'
const walltEnvironment = ref('mainnet')//钱包所在的环境
const loading = ref(true)
const joke = ref('')//钱包所在的环境
const pagesArray = ref(['create', 'createWallt', 'importWallt', 'userContent', 'buyPage', 'urlConnect', 'hashDetail'])//页面地址数组,数组顺序为正常流程顺序
const pageTypes = ref('buyPage')//判断当前应该展示那个页面
const walltContent = ref({})//钱包所在的环境
const userAddress = ref('')//钱包所在的环境
const web3 = ref({})
onMounted(() => {
	indexDbData.getData('rpc_url').then(res => {
		if (res && res.unit) {
			if (res.unit == 'ETH') walltEnvironment.value = 'mainnet'
			if (res.unit == 'BNB') walltEnvironment.value = 'test'
		}
	}).catch(err => { })
	indexDbData.getDatas().then(res => {
		console.log(res, '4545dsada');
	}).catch(err => { })
})
// 获取账户相关信息
const getInfo = () => {
	let query = getQueryParams();
	// 当前用户信息
	indexDbData.getData('currentWalltAddress').then(res => {
		if (res && res.address) {
			pageTypes.value = 'userContent'
			userAddress.value = res.address;
			getBlance()
		} else {
			if (query && query.pageType) {
				if (query.pageType == 'createWallt') pageTypes.value = 'create';
				if (query.pageType == 'importWallt') pageTypes.value = 'importWallt';
				loading.value = false;
			} else {
				pageTypes.value = 'create'
				loading.value = false;
			}
		}
	}).catch(err => { })
}
const getBlance = () => {
	let data = getCurrentInstance();
	indexDbData.getData('rpc_url').then(res => {
		// 定义rpc
		web3.value = new Web3(new Web3.providers.HttpProvider(res.url));
		// 全局定义web3
		if (data) data.appContext.config.globalProperties.$web3 = web3.value;
		// 指定钱包单位
		walltContent.value.balanceUnit = res.unit;
		walltContent.value.url = res.url;
		walltContent.value.CHAIN_ID = res.CHAIN_ID;
		// 钱包地址
		walltContent.value.address = userAddress.value;
		// 获取钱包余额
		web3.value.eth.getBalance(userAddress.value).then(res => {
			console.log(res);
			let balance = web3.value.utils.fromWei(res, 'ether') * 1;
			balance = String(balance).replace(/^(.*\..{4}).*$/, '$1');
			walltContent.value.balance = balance;
			getHexHash()
		}).catch(err => { });
	}).catch(err => { })
}
const getHexHash = () => {
	indexDbData.getData('txHash').then(res => {
		if (res) {
			// 转账记录
			walltContent.value.txHash = res.txHashList;
		}
		// 测试
		setTimeout(() => {
			loading.value = false;
		}, 500)
	}).catch(err => { })
}
// 返回上个页面
const returnPage = () => {
	// let index = this.pagesArray.indexOf(this.pageTypes);
	// if (this.pageTypes == 'importWallt') this.pageTypes = 'create';
}
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
// 下一步
const nextPage = (res) => {
	if (res == 'userContent') {
		location.reload()
	} else {
		pageTypes.value = res;
	}
}
</script>
<style lang='scss'>
@import './index/index.scss';
</style>

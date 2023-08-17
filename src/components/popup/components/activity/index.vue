<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, inject } from 'vue';
import indexDbData from '@/utils/indexDB';
import { getCookie, setCookie, formatDate } from '@/utils/index.js';
import bus from '@/utils/bus.js';
const userName = ref('')
const address = ref('')
const txHash = ref([])
const txHashList = ref([])
const balanceUnit = ref('')
const web3 = ref(null)
onMounted(() => {
	web3.value = inject('web3')
	indexDbData.getData('currentWalltAddress').then(res => {
		if (res && res.address) {
			userName.value = res.userName ? res.userName : '';
			address.value = res.address;
		} else {
		}
	}).catch(err => { })
	indexDbData.getData('rpc_url').then(res => {
		if (res && res.unit) {
			// 指定钱包单位
			balanceUnit.value = res.unit;
		} else {
		}
	}).catch(err => { })

	indexDbData.getData('txHash').then(info => {
		if (!info) return;
		txHash.value = info.txHashList;
		if (txHash.value && txHash.value.length) {
			hashDispose()
		}
	}).catch(err => { })
})
// 关闭整个组件
const closeModal = () => {
	console.log(8888888888888);
	bus.emit('closeMore', '')
}
const openAteonscan = () => {
	alert('跳转到QITMEER首页')
	closeModal()
}
const hashDispose = () => {
	txHash.value.forEach(item => {
		web3.value.eth.getTransaction(item.transactionHash).then(res => {
			let date;
			if (!item.date) date = Date.now();
			if (item.date) date = item.date;
			date = formatDate(date);
			let data = Object.assign({}, res, { time: date });
			txHashList.value.push(data)
		})
	});
}
// wei转币
const toWei = (value) => {
	let data = web3.value.utils.fromWei(value, 'ether');
	return data;
}
</script>
<style lang='scss'>
@import './index.scss';
</style>
<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
import bus from '@/utils/bus.js';
import indexDbData from '@/utils/indexDB';
const props = defineProps(['walltContent'])
const transactionHash = ref(0)
const moreShow = ref(false)
const txHash = ref([])
const address = ref('')
const userName = ref('')
const txHashList = ref([])
const balanceUnit = ref('')
const transferContent = ref({})
const detailBol = ref(false)
const web3 = ref(null)
onMounted(() => {
	let data = getCurrentInstance();
	// web3.value = data.appContext.config.globalProperties.web3.value;

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
		console.log(info, 'txHashList');
		if (!info) return;
		txHash.value = info.txHashList;
		if (txHash.value && txHash.value.length) {
			hashDispose()
		}
	}).catch(err => { })
})
const hashDispose = () => {
	// txHash.value.forEach(item => {
	// 	console.log(web3.value, 888888888888888);
	// 	web3.value.eth.getTransaction(item.transactionHash).then(res => {
	// 		let date;
	// 		if (!item.date) date = Date.now = () =>;
	// 		if (item.date) date = item.date;
	// 		date = formatDate(date);
	// 		let data = Object.assign({}, res, { time: date });
	// 		data.valueOld = web3.value.utils.fromWei(data.value, 'ether');
	// 		console.log(data);
	// 		txHashList.push(data)
	// 	})
	// });

}
const closeMore = () => {
	moreShow.value = false;
}
const closeModal = () => {

}
// 关闭更多相关页面
const modalOperate = () => {
	moreShow.value = false;
}
const onCopy = () => {
	navigator.clipboard.writeText(props.walltContent.address);
	// $message.success('Copy Success!')
}
const refresh = () => {
	location.reload()
}
// wei转币
const toWei = (value) => {
	return web3.value ? web3.value.utils.fromWei(value, 'ether') : null;
}
const toPage = (res) => {
	bus.emit('openModal', res)
}
const sendTo = () => {
	bus.emit('nextPage', 'sendTo')
}
</script>
<style lang='scss'>
@import './index.scss';
</style>
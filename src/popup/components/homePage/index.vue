<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, inject } from 'vue';
import bus from '@/utils/bus.js';
const transactionHash = ref(0);
const moreShow = ref(false);
// const props = defineProps(['walltContent'])
onMounted(() => {
	// if (props.walltContent.txHash && props.walltContent.txHash.length > 1) {
	// 	let index = props.walltContent.txHash.length - 1;
	// 	let txHash = props.walltContent.txHash[index];
	// 	toWei(txHash)
	// } else {
	// 	if (!props.walltContent.txHash) return;
	// 	let txHash = props.walltContent.txHash[0];
	// 	toWei(txHash)
	// }
})

const closeMore = () => {
	console.log(787878);
	moreShow.value = false;
}
// 关闭更多相关页面
const modalOperate = () => {
	moreShow.value = false;
}
const onCopy = () => {
	// navigator.clipboard.writeText(props.walltContent.address);
	// $message.success('Copy Success!')
}
const refresh = () => {
	location.reload()
}
// wei转币
const toWei = (data) => {
	// if (!data) return;
	// let web3 = inject('web3')
	// web3.eth.getTransaction(data.transactionHash).then(res => {
	// 	if (!res) return;
	// 	transactionHash.value = web3.utils.fromWei(res.value, 'ether');
	// })
}
const toPage = (res) => {
	bus.emit('openModal', res)
}
const sendTo = () => {
	bus.emit('nextPage', 'sendTo')
}
const hashDetail = () => {
	bus.emit('nextPage', 'assetsRecording')
}
</script>
<style lang="scss">
@import "./index.scss";
</style>
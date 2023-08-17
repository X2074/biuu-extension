<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, inject } from 'vue';
import indexDbData from '@/utils/indexDB';
import { getCookie, setCookie, formatDate } from '@/utils/index.js';
import bus from '@/utils/bus.js';
import QRCode from 'qrcodejs2'
const userName = ref('')
const address = ref('')
const qrCodeUrl = ref(null)
onMounted(() => {
	indexDbData.getData('currentWalltAddress').then(res => {
		if (res && res.address) {
			userName.value = res.userName ? res.userName : '';
			address.value = res.address;
			createdCode()
		} else {
		}
	}).catch(err => { })
})
// 关闭整个组件
const closeModal = () => {
	bus.emit('closeMore', '')
}
const createdCode = () => {
	console.log(qrCodeUrl.value, 5465465654456);
	let self = this;
	let qrcode = new QRCode(qrCodeUrl.value, {
		text: address.value,
		width: 116,
		height: 116,
		clorDark: '#000000',
		colorLight: '#ffffff',
		correctLevel: QRCode.CorrectLevel.H
	})
}
const onCopy = () => {
	navigator.clipboard.writeText(address.value)
	// $message.success('Copy Success!')
}
const openAteonscan = () => {
	alert('跳转到QITMEER首页')
	closeModal()
}
const openModal = (res) => {
	bus.emit('toModal', res)
}
</script>
<style lang='scss'>
@import './index.scss';
</style>
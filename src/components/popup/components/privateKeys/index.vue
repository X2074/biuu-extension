<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, inject } from 'vue';
import indexDbData from '@/utils/indexDB';
import bus from '@/utils/bus.js';
import md5 from 'js-md5';
const userName = ref('')
const address = ref('')
const passwordValue = ref('')
const privateKey = ref('')
const passKey = ref('')
const incorrect = ref(false)
const privateKeyBol = ref(false)
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
	// 获取密码
	indexDbData.getData('5ebe2294ecd0e0f08eab7690d2a6ee69').then(res => {
		console.log(res);
		passKey.value = res.secret;
	}).catch(err => { })
})// 关闭整个组件
const closeModal = () => {
	bus.emit('closeMore', '')
}
const onCopy = () => {
	navigator.clipboard.writeText(privateKey.value.privateKey)
	// $message.success('Copy Success!')
}
const openAteonscan = () => {
	alert('跳转到ateonscan首页')
	closeModal()
}
const confirm = () => {
	incorrect.value = false;
	// 获取keyStore
	if (md5(passwordValue.value) == passKey.value) {
		// 获取当前账户的密钥
		indexDbData.getData(address.value).then(res => {
			console.log(passwordValue.value, 'privateKey');
			// 获取密钥
			privateKey.value = web3.value.eth.accounts.decrypt(res.keystore, passwordValue.value);
			console.log(privateKey.value, '8888privateKey');
			privateKeyBol.value = false;
		}).catch(err => { })
	} else {
		incorrect.value = true;
	}
}
</script>
<style lang='scss'>
@import './index.scss';
</style>
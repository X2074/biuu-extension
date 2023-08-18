
<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, watchEffect, getCurrentInstance } from 'vue';
import bus from '@/utils/bus.js';
import indexDbData from '@/utils/indexDB';
import EthereumTx from 'ethereumjs-tx';
const props = defineProps(['walltContent'])
const transactionHash = ref(0)
const moreShow = ref(false)
const sendAddress = ref('0x4445Bbd1f0942857741EEbA3B36970390E9cb887')
const sendBol = ref(false)
const numberStep = ref(1)
const assetNum = ref(0)
const gasPrice = ref(1000000000000)
const gasLimit = ref(530000)
const sendMaxTotal = ref(0)
const blance = ref(0)
const userAddress = ref(null)
const blanceWei = ref(0)
const sendTotal = ref(0)
const dataKey = ref(null)
const loading = ref(false)
const balance = ref(null)
const web3 = 'getCurrentInstance()?.appContext.config.globalProperties.$web3';

onMounted(() => {
	let data = getCurrentInstance();
	setTimeout(() => {
		console.log(data.appContext.config.globalProperties.$web3, 'web3');
	}, 1500)
})
// 获取账户相关信息
const getInfo = () => {
	// 当前用户信息
	indexDbData.getData('currentWalltAddress').then(res => {
		if (res && res.address) {
			userAddress.value = res.address;
			getBlance()
		} else {
			loading.value = false;
		}
	}).catch(err => { })
}
const getBlance = () => {
	// 获取钱包余额
	web3.value.eth.getBalance(userAddress)
		.then(res => {
			blanceWei.value = res;
			if (!res) {
				balance.value = 0;
			} else {
				let balance = web3.value.utils.fromWei(res, 'ether') * 1;
				console.log(balance, 'blance');
				balance = String(balance).replace(/^(.*\..{4}).*$/, '$1');
				blance.value = balance;
			}
		}).catch(err => {

		})
}
const closeMore = () => {
	bus.emit('closeMore', 'homePage')
}
const searchInput = () => {
	sendBol.value = false;
	console.log(sendAddress.value.length);
	if (!sendAddress.value) return;
	if (sendAddress.value.indexOf('0x') || sendAddress.value.indexOf('0x') > 0) sendBol.value = true;
	if (sendAddress.value.length != 42) sendBol.value = true;
	numberStep.value = 2;
}
const cancelInput = () => {
	sendBol.value = false;
	sendAddress.value = '';
}
// 转账金额
const handleChangeAsset = () => {
	let num = web3.value.utils.toWei(assetNum.value + '', 'ether')// 转账 wei 
	let nums = num * 1 + gasPrice.value * 1;
	let numMax = num * 1 + gasLimit.value * 1;
	sendTotal.value = web3.value.utils.fromWei(nums + '', 'ether');
	sendMaxTotal.value = web3.value.utils.fromWei(numMax + '', 'ether');
	if (nums > blanceWei.value * 1) {
		alert('Insufficient balance!')
	} else {
		numberStep.value = 3;
	}
}
// 转账功能
const swapBlance = () => {
	loading.value = true;
	web3.value.eth.defaultAccount = props.walltContent.address;
	console.log('gasPrice', gasPrice.value);
	web3.value.eth.getTransactionCount(web3.value.eth.defaultAccount).then(res => {
		let details = {
			to: sendAddress.value, // 接收方地址                                                             
			value: web3.value.utils.toHex(web3.value.utils.toWei(assetNum.value + '', 'ether')), // 转账 wei  
			gasLimit: web3.value.utils.toHex(gasLimit),
			gasPrice: web3.value.utils.toHex(gasPrice),
			// meer交易此处需要使用int类型
			// gasLimit: gasLimit,   
			// gasPrice: gasPrice,
			// 'nonce': web3.value.utils.toHex(res+10), //meer交易这个可以不填// 序号ID, 重要， 需要一个账号的交易序号，可以通过web3.eth.getTransactionCount(web3.eth.defaultAccount)获得
			chainId: props.walltContent.CHAIN_ID
		}
		console.log(details, 2222);
		let privateKey = Buffer.from(dataKey.value.privateKey.substr(2), 'hex')
		let tx = new EthereumTx(details)
		tx.sign(privateKey.value)
		let serializedTx = tx.serialize();
		let raw = '0x' + serializedTx.toString('hex');
		console.log(raw, 1111);
		try {
			web3.value.eth.sendSignedTransaction(raw).on('receipt', (res) => {
				console.log(res, '交易后的hash');
				loading.value = false;
				indexDbData.getData('txHash').then(info => {
					if (info && info.txHashList.length > 0) {
						let data = info;
						let hash = res;
						hash.date = Date.now()
						data.txHashList.push(res);
						indexDbData.putData(data)
					} else {
						let hash = res;
						hash.date = Date.now()
						let data = {
							id: 'txHash',
							txHashList: [hash]
						}
						indexDbData.putData(data)
					}
				}).catch(err => { })
				closeMore()
			}).on('error', (error) => {
				// $message.error(error)
				console.log('error', error)
			})
		} catch (err) {
			console.log(err, 897899878789);
		}
	})
}
</script>
<style lang='scss'>
@import './index.scss';
</style>
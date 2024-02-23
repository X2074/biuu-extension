<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, defineProps, getCurrentInstance } from 'vue';
import bus from '@/utils/bus.js';
import { evmKey, Decrypt,Encrypt, evmTransfer } from '@/utils/index.js';
import indexDbData from '@/utils/indexDB';
import Web3 from 'web3'
import EthereumTx from 'ethereumjs-tx';
import md5 from 'js-md5';
const props = defineProps(['walltContent'])
const transactionHash = ref(0)
const moreShow = ref(false)
const sendAddress = ref('0x4445Bbd1f0942857741EEbA3B36970390E9cb887')
const sendBol = ref(false)
const numberStep = ref(1)
const assetNum = ref(0)
const gasPrice = ref(100000000)
const gasLimit = ref(53000)
const sendMaxTotal = ref(0)
const blance = ref(0)
const userAddress = ref(null)
const blanceWei = ref(0)
const sendTotal = ref(0)
const dataKey = ref(null);//私钥
const loading = ref(false)
const balance = ref(null)
const web3 = ref(null);
const rpcUrl = ref(null)
let passKey = ref('')
onMounted(() => {
	indexDbData.getData('rpc_url').then(res => {
		let data = res.content;
		rpcUrl.value = data;
		// 定义rpc
		web3.value = new Web3(new Web3.providers.HttpProvider(data.url));
	})
	getInfo()
    // 获取设置的密码
	indexDbData.getData(md5('secret')).then(res => {
		passKey.value = res.secret;
		getKey()
	}).catch(err => { })
})
// 通过助记词生成密钥
const getKey = () => {
	indexDbData.getData('keyStore').then(res => {
		console.log(res);
		// 第二个参数为密码，后期改为获取数据库密码或者是用户输入
		let encryption = Decrypt(res.secret, passKey.value);
		console.log(encryption,'encryption');
		
		evmKey(encryption).then(keys => {
			console.log(keys, 'keys');
			dataKey.value = keys.privateKey;
		})
		// let mnemonic
	})
}
// 获取账户相关信息
const getInfo = () => {
	// 当前用户信息
	indexDbData.getData('currentWalltAddress').then(res => {
		let data = res;
		if (data && data.address) {
			userAddress.value = data.address;
			getBlance()
		} else {
			loading.value = false;
		}
	}).catch(err => { })
}
const getBlance = () => {
	// 获取钱包余额
	web3.value.eth.getBalance(userAddress.value)
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
	bus.emit('nextPage', 'homePage')
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
	console.log(blanceWei.value, 'blanceWei.value', nums, 'nums');
	
	if (nums > blanceWei.value * 1) {
		alert('Insufficient balance!')
	} else {
		numberStep.value = 3;
	}
}
// 转账功能
const swapBlance = () => {
	loading.value = true;
	console.log('gasPrice', gasPrice.value);
	let data = {
		address: props.walltContent.address,
		rpc: rpcUrl.value.url,
		sendAddress: sendAddress.value, // 接收方地址                       
		assetNum: assetNum.value, // 转账 wei
		gasLimit: gasLimit.value,
		gasPrice: gasPrice.value,
		chainId: rpcUrl.value.CHAIN_ID,
		key: dataKey.value//私钥
	}
	// 转账函数  转账成功后会触发，可以添加loading状态
	evmTransfer(data).then(res => {
		console.log(res, 'jiaoyi adsdasd');
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
	})
}
</script>
<style lang='scss'>
@import './index.scss';
</style>
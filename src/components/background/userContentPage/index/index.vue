<template src='./index.html'></template>
<script lang='ts' setup>

import { ref, onMounted, watchEffect, getCurrentInstance } from 'vue';
import indexDbData from '../../../../utils/indexDB.js';
import bus from '@/utils/bus.js';
import md5 from 'js-md5';
import bip39 from 'bip39';
import { hdkey } from 'ethereumjs-wallet';
import util from 'ethereumjs-util';
import eip55 from 'eip55';
import Web3 from 'web3';
const EthereumTx = require('ethereumjs-tx');
const loading = ref(false);
const userAddress = ref('');
const web3 = ref(null);
const balance = ref(0);//余额
const balanceUnit = ref('ETH');
const transactionHash = ref(0);
const walltContent = ref({
	balanceUnit: '',
	url: '',
	CHAIN_ID: '',
	address: '',
	balance: '',
	txHash: ''
});
// 当前用户信息
indexDbData.getData('currentWalltAddress').then(res => {
	// 钱包地址
	walltContent.value.address = res.address;
})
// 当前用户信息
indexDbData.getData('txHash').then(res => {
	if (res) {
		// 转账记录
		walltContent.value.txHash = res.txHashList;
	}
})
// 获取钱包信息
indexDbData.getData('rpc_url').then(res => {
	// 定义rpc
	web3.value = new Web3(new Web3.providers.HttpProvider(res.url));
	walltContent.value.balanceUnit = res.unit;
	walltContent.value.url = res.url;
	walltContent.value.CHAIN_ID = res.CHAIN_ID;
	// 获取钱包余额
	web3.value.eth.getBalance(userAddress)
		.then(res => {
			console.log(res);
			let balance = web3.value.utils.fromWei(res, 'ether') * 1;
			walltContent.value.balance = String(balance).replace(/^(.*\..{4}).*$/, '$1');
		}).catch(err => { });
})
onMounted(() => {
	if (walltContent.value.txHash && walltContent.value.txHash.length > 1) {
		let index = walltContent.value.txHash.length - 1;
		let txHash = walltContent.value.txHash[index];
		toWei(txHash)
	} else {
		if (!walltContent.value.txHash) return;
		let txHash = walltContent.value.txHash[0];
		toWei(txHash)
	}
}
)
// 转账功能
const swapBlance = (data) => {
	web3.value.eth.defaultAccount = walltContent.value.address;
	web3.value.eth.getTransactionCount(web3.value.eth.defaultAccount).then(res => {
		let details = {
			to: '0x4445Bbd1f0942857741EEbA3B36970390E9cb887', // 接收方地址                                                              
			value: web3.value.utils.toHex(web3.value.utils.toWei('0.01', 'ether')), // 转账 0.1wei  
			gasLimit: web3.value.utils.toHex(99000),
			gasPrice: web3.value.utils.toHex(10e9),
			nonce: web3.value.utils.toHex(res++), // 序号ID, 重要， 需要一个账号的交易序号，可以通过web3.eth.getTransactionCount(web3.eth.defaultAccount)获得
			chainId: walltContent.value.CHAIN_ID
		}
		let privateKey = Buffer.from(data.privateKey.substr(2), 'hex')
		let tx = new EthereumTx(details)
		tx.sign(privateKey)
		var serializedTx = tx.serialize();
		let raw = '0x' + serializedTx.toString('hex');
		web3.value.eth.sendSignedTransaction(raw).on('receipt', (res) => {
			console.log(res, '交易后的hash');
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
		});
		// (raw,(err,txHash)=>{
		// })
	})
}
const webSign = () => {
	let details = {
		to: '0x5cf83df52a32165a7f392168ac009b168c9e8915', // 接收方地址    
		value: 4052500000, // 转账多少wei                                                             
		gas: 51000, // GAS                                                                     
		gasPrice: 2 * 1000000000, // GAS PRICE 需要一个比较合理的价格， 不然可能会报错（replacement transaction underpriced）                                                                              
		gasLimit: '0x420710',
		nonce: 40, // 序号ID, 重要， 需要一个账号的交易序号，可以通过web3.eth.getTransactionCount(web3.eth.defaultAccount)获得
		chainId: 11243575,
		data: '0x40aabbccdd000011223344'
	}
}
const toCreate = () => {
	let createData = {
		url: 'chrome-extension://kkhfpjkgnkckiofggkkiedpfjknmpemo/walltBackground.html?query=newPage', //打开的网页地址（即'http://www.google.com'，不是'www.google.com'）
		left: 0, //新视窗相对于屏幕的左边缘的位置的像素值。如果没有指定，那么新的视窗从最后一个    有焦点的视窗自然偏移。
		top: 0, //新视窗相对于屏幕的上边缘的位置的像素值。如果没有指定，那么新的视窗从最后一个有焦点的视窗自然偏移。
		width: 560, //新视窗的像素宽度。如果没有指定，默认为自然宽度。
		height: 500, //新视窗的像素高度。如果没有指定，默认为自然高度。
		type: 'popup', // ( optional enumerated string ['normal', 'popup']可选，枚举字符串['normal', 'popup'] ) 指定新建浏览器视窗的类型。
	}
	//打开一个浏览器
	// chrome.windows.create(createData, () => {
	// 	window.close();
	// 	console.log('打开新页面')
	// })
}
const onCopy = () => {
	navigator.clipboard.writeText(userAddress.value)
	// $message.success('Copy Success!')
}
const toPage = (res) => {
	if (res == 'buy') bus.emit('nextPage', 'buyPage')
}
const refresh = () => {
	location.reload()
}
const hashDetail = () => {
	bus.emit('nextPage', 'hashDetail')
}
// wei转币
const toWei = (data) => {
	if (!data) return;
	web3.value.eth.getTransaction(data.transactionHash).then(res => {
		if (!res) return;
		transactionHash.value = web3.value.utils.fromWei(res.value, 'ether');
	})
}
</script>
<style lang='scss'>
@import './index.scss';
</style>
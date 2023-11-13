<template src='./index.html'></template>
<script lang='ts' setup>

import { ref, onMounted, watchEffect, getCurrentInstance, nextTick } from 'vue';
import indexDbData from '../../../../utils/indexDB.js';
import bus from '../../../../utils/bus.js';
import Web3 from 'web3';
const userAddress = ref('');
const web3 = ref({});
const transactionHash = ref(0);
const walltEnvironment = ref({})//钱包所在的网络
const walltContent = ref({
	balanceUnit: '',
	url: '',
	CHAIN_ID: '',
	address: '',
	balance: '',
	txHash: ''
});
const netWorkList = ref([]);//下拉列表的网络数据
const userList = ref([]);//下拉列表的用户数据
const netWorkType = ref('EVM');//网络类型
const walltUser = ref('EVM');//选中的用户数据
// 当前用户信息
const getUser = () => {
	indexDbData.getData('currentWalltAddress').then(res => {
		if (res) {
			let data = res;
			// 钱包地址
			walltUser.value = data.address;
			walltContent.value.address = data.address;
			// // 获取钱包余额
			web3.value.eth.getBalance(data.address)
				.then(res => {
					console.log(res);
					let balance = web3.value.utils.fromWei(res, 'ether') * 1;
					walltContent.value.balance = String(balance).replace(/^(.*\..{4}).*$/, '$1');
				}).catch(err => { });
		}
	})
}
// 当前用户信息
indexDbData.getData('txHash').then(res => {
	if (res) {
		// 转账记录
		walltContent.value.txHash = res.txHashList;
	}
})
// 获取钱包信息
indexDbData.getData('rpc_url').then(res => {
	let data = res.content;
	console.log(data, 'data');
	// 定义rpc
	web3.value = new Web3(new Web3.providers.HttpProvider(data.url));
	// 获取代币标识
	walltContent.value.balanceUnit = data.unit;
	// rpc地址
	walltContent.value.url = data.url;
	// chain id
	walltContent.value.CHAIN_ID = data.CHAIN_ID;
	walltEnvironment.value = data.CHAIN_ID;
	netWorkChange(data.type || 'EVM')
	getUser()
	getUserList()
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
// 获取用户列表
const getUserList = () => {
	indexDbData.getData('rpc_url').then(res => {
		userList.value = res.content.walltInfo;
	})
}
// 网络切换
const netWorkChange = (type) => {
	netWorkType.value = type;
	indexDbData.getData(type).then(res => {
		let data = Object.values(res.content);
		netWorkList.value = data;
	})
}
// 选中的网络
const rpcChange = async (event) => {
	let id = event.target.value + '';
	console.log(id, 'sadasdsad');
	indexDbData.getData(netWorkType.value).then(res => {
		let data = res.content[id];
		data.type = netWorkType.value;
		// 存储选中的网络数据
		indexDbData.putData({
			id: 'rpc_url',
			content: res.content[id]
		})
	})
	// 当前用户信息
	let currentWalltAddress = await indexDbData.getData('currentWalltAddress');
	console.log(currentWalltAddress, 'currentWalltAddress');
	// evm数据
	let content = await indexDbData.getData('EVM');
	content.content[id].walltInfo = [currentWalltAddress]
	userList.value = content.content[id].walltInfo;
	// 选中的网络数据添加用户
	indexDbData.putData({
		id: 'EVM',
		content: content.content
	})
}
// 选中的地址
const userChange = (event) => {
	let address = event.target.value;
	let currentWalltAddress = userList.value.filter(item => {
		return item.address == address;
	})
	let data = currentWalltAddress[0];
	// 存储选中的用户数据
	indexDbData.putData({
		id: 'currentWalltAddress',
		// 不经过转换属于proxy格式，无法识别
		content: JSON.parse(JSON.stringify(data))
	})
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

const openPage = () => {
    let createData = {
		url: 'chrome-extension://bjogegnhblmapbajppakikonghmglkkb/indexPage.html', //打开的网页地址（即'http://www.google.com'，不是'www.google.com'）
		left: 0, //新视窗相对于屏幕的左边缘的位置的像素值。如果没有指定，那么新的视窗从最后一个    有焦点的视窗自然偏移。
		top: 0, //新视窗相对于屏幕的上边缘的位置的像素值。如果没有指定，那么新的视窗从最后一个有焦点的视窗自然偏移。
		width: 560, //新视窗的像素宽度。如果没有指定，默认为自然宽度。
		height: 500, //新视窗的像素高度。如果没有指定，默认为自然高度。
		type: 'popup' // ( optional enumerated string ["normal", "popup"]可选，枚举字符串["normal", "popup"] ) 指定新建浏览器视窗的类型。
    }
    //打开一个浏览器
	chrome.windows.create(createData, () => {
		window.close();
		console.log('打开新页面')
	})
    // window.open('chrome-extension://bjogegnhblmapbajppakikonghmglkkb/background.html')
}
</script>
<style lang='scss'>
@import './index.scss';
</style>
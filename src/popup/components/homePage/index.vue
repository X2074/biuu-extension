<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, defineProps, nextTick } from 'vue';
import bus from '@/utils/bus.js';
import indexDbData from '@/utils/indexDB';
import Web3 from 'web3'
import selectAccount from "@/components/popup/homePage/selectAccount/index/index.vue"
const transactionHash = ref(0);
const moreShow = ref(false);
const props = defineProps(['walltContent'])
const web3 = ref(null);
let walltContent = ref(null)
const netWorkList = ref([]);//下拉列表的网络数据
const userList = ref([]);//下拉列表的用户数据
const netWorkType = ref('EVM');//网络类型
const walltUser = ref('EVM');//选中的用户数据
const walltEnvironment = ref({})//钱包所在的网络
const walltAccount = ref('')
onMounted(() => {
	console.log(props,'propspropsprops');
	
	indexDbData.getData('rpc_url').then(res => {
		if(!res) {
			netWorkChange('EVM')
		}else{
			netWorkChange('EVM')
			walltEnvironment.value = res;
			// 定义rpc
			web3.value = new Web3(new Web3.providers.HttpProvider(res.url));
			getHash()
		};
	})
})
// 交易hash
const getHash = () => {
	walltContent.value = JSON.parse(JSON.stringify(props.walltContent))
	if(!walltContent.value || !walltContent.value.txHash) return;
	if (walltContent.value.txHash && walltContent.value.txHash.length > 1) {
		let index = walltContent.value.txHash.length - 1;
		let txHash = walltContent.value.txHash[index];
		console.log(txHash, 'txHash');

		toWei(txHash)
	} else {
		console.log(walltContent.value, 2222);
		if (!walltContent.value.txHash) return;
		console.log(3333);
		let txHash = walltContent.value.txHash[0];
		toWei(txHash)
	}
}
const onCopy = () => {
	navigator.clipboard.writeText(walltContent.value.address);
	alert('Copy Success!')
}
const refresh = () => {
	location.reload()
}
// wei转币
const toWei = (data) => {
	console.log(web3.value, 'sadsadsadsad');

	if (!data) return;
	web3.value.eth.getTransaction(data.transactionHash).then(res => {
		if (!res) return;
		transactionHash.value = web3.value.utils.fromWei(res.value, 'ether');
	})
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

// 网络切换
const netWorkChange = (type) => {
	netWorkType.value = type;
	indexDbData.getData(type).then(res => {
		let data = Object.values(res.content);
		netWorkList.value = data;
		console.log(netWorkList.value,'netWorkList.value');
		
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
// 关闭更多相关页面
bus.on('modalOperate', (res) => {
	moreShow.value = false;
})
bus.on('closeMore', () => {
	moreShow.value = false;
})
// homepage模块里面的返回按钮
bus.on('homePageBack', (res) => {
	walltAccount.value = res || '';
})
</script>
<style lang="scss">
@import "./index.scss";
</style>
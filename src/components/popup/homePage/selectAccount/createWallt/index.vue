<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, defineProps, toRaw } from 'vue';
import bus from '@/utils/bus.js';
import indexDbData from '@/utils/indexDB';
import Web3 from 'web3'
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
onMounted(() => {
	indexDbData.getData('rpc_url').then(res => {
		if(!res) {
			netWorkChange('EVM')
		}else{
			netWorkChange(res.type?res.type:'EVM')
			let data = res.content;
			walltEnvironment.value = data.unit;
			// 定义rpc
			web3.value = new Web3(new Web3.providers.HttpProvider(data.url));
			getHash()
		};
		
	})
})
// 交易hash
const getHash = () => {
	walltContent.value = toRaw(props.walltContent)
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
// 关闭更多相关页面
bus.on('modalOperate', (res) => {
	moreShow.value = false;
})
bus.on('closeMore', () => {
	moreShow.value = false;
})
const onCopy = () => {
	navigator.clipboard.writeText(walltContent.value.address);
    bus.emit('promptModalSuccess','复制成功')
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
</script>
<style lang="scss">
@import "./index.scss";
</style>
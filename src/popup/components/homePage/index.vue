<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, defineProps, nextTick } from 'vue';
import bus from '@/utils/bus.js';
import indexDbData from '@/utils/indexDB';
import Web3 from 'web3'
import selectAccount from "@/components/popup/homePage/selectAccount/index/index.vue"
import setting from "@/components/popup/homePage/setting/index.vue"
import networkSwitching from "@/components/popup/homePage/networkSwitching/index.vue"
import importNfts from "@/components/popup/homePage/nfts/importNfts/index.vue"
import nftDetail from "@/components/popup/homePage/nfts/nftDetail/index.vue"
// 底部card部分
import nftCard from "@/components/popup/homePage/nfts/nftsCard/index.vue"
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
const pageType = ref('');//当前需要展示的页面
let loading = ref(true)
let loadingText = ref('加载中...')
let tabsOption = ref('nfts');//底部tabs切换
let nftDetails = ref(null)
onMounted(() => { 
	initialize()
})
// 初始化
const initialize = async ()=>{
	let data = await indexDbData.getData('rpc_url')
	if(!data) {
		netWorkChange('EVM')
	}else{
		// 是否有选中的模式
		await netWorkChange(data.netType ? data.netType : 'EVM')
		walltEnvironment.value = data;
		// 定义rpc
		web3.value = new Web3(new Web3.providers.HttpProvider(data.url));
		await getHash()
		loading.value = false;
	};
}
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
	navigator.clipboard.writeText(props.walltContent.address);
    bus.emit('promptModalSuccess','复制成功');
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
	moreShow.value = !moreShow.value;
	pageType.value = 'showKey';
	walltAccount.value = 'selectAccount';
}
const sendTo = () => {
	bus.emit('nextPage', 'sendTo')
}
const hashDetail = () => {
	bus.emit('nextPage', 'assetsRecording')
}

// 当前网络数据
const netWorkChange = (type) => {
	netWorkType.value = type;
	indexDbData.getData(type).then(res => {
		let data = Object.values(res.content);
		netWorkList.value = data;
		console.log(netWorkList.value,'netWorkList.value');
	})
}
bus.on('closeMore', () => {
	moreShow.value = false;
})
// homepage模块里面的返回按钮
bus.on('homePageBack', (res) => {
	loading.value = true;
	walltAccount.value = res.page || '';
	console.log(res,'跳转nft详情');
	
	if(res.data && res.page == 'nftDetail'){//nft详情需要的数据
		nftDetails.value = res.data;
	}else{
		initialize()
	}
})
</script>
<style lang="scss">
@import "./index.scss";
</style>
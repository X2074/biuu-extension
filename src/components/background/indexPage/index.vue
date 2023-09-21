<template src='./index/index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, watchEffect, getCurrentInstance } from 'vue';
import indexDbData from '../../../utils/indexDB';
import { evmKey, Decrypt, evmTransfer } from '@/utils/index.js';
// 预制网络
import netWork from '../../../utils/netWork.json'
import { getNFTContent, NFTTransfer } from '../../../utils/nft.js'
import Web3 from 'web3'
const walltEnvironment = ref('mainnet')//钱包所在的环境
const loading = ref(true)
const joke = ref('')//钱包所在的环境
const pagesArray = ref(['create', 'createWallt', 'importWallt', 'userContent', 'buyPage', 'urlConnect', 'hashDetail'])//页面地址数组,数组顺序为正常流程顺序
const pageTypes = ref('buyPage')//判断当前应该展示那个页面
const walltContent = ref({})//钱包所在的环境
const userAddress = ref('')//钱包所在的环境
const web3 = ref({})

const netWorkList = ref([]);//下拉列表的网络数据
onMounted(() => {
	netWorkChange()
	getNft();
})
// 网络切换
const netWorkChange = () => {
	indexDbData.getData('EVM').then(res => {
		let data = Object.values(res.content);
		netWorkList.value = data;
	})
}
// 新增网络
let networkName = ref('');
let RpcUrl = ref('');
let tokenId = ref('');
let symbol = ref('');
let Blockchain = ref('');
// 新增evm网络
const addNetWork = () => {
	indexDbData.getData('EVM').then(res => {
		let data = {};
		data[tokenId.value] = {
			CHAIN_ID: tokenId.value,
			netName: networkName.value,
			unit: symbol.value,
			url: RpcUrl.value,
			walltInfo: []
		}
		res.content = Object.assign(res.content, data)
		indexDbData.putData(res)
	})
}
// nft相关
const nftAddress = ref('')
const nftId = ref('')
//0x763482F3FA257C82176D1c6A21e0D5582850D4E3   1
const getNft = async () => {
	// indexDbData.getData('keyStore').then(res => {
	// 	// 第二个参数为密码，后期改为获取数据库密码或者是用户输入
	// 	let encryption = Decrypt(res.secret, 'admin123456');
	// 	console.log(encryption);
	// 	evmKey(encryption).then(keys => {
	// 		console.log(keys, 'keys');
	// 	})
	// 	// let mnemonic
	// })
	let abi = await getNFTContent('0x995ab346Db2AB84990552DA8cC5Bd474E2888c03', 70)
	NFTTransfer('0x995ab346Db2AB84990552DA8cC5Bd474E2888c03', '0x243Def9569745c3ae44029526e9449572201B522', '0x533f6FEcE8aF41da6c41de7aF13D289bA92f9fE9', 70)
}

</script>
<style lang='scss'>
@import './index/index.scss';
</style>
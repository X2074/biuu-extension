<template>
	<div class="meer-wallt">
		<!-- 首次进入 -->
		<create v-if="pageTypes == 'create'" />
		<!-- 创建钱包 -->
		<creasteWalletPage v-if="pageTypes == 'creasteWalletPage'" />
  </div>
  
</template>

<script lang="ts" setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
import md5 from 'js-md5';
// 因为popup的特殊原因，此处只有一个入口，页面切换靠各种类型的判断
// import homePage from '@/components/homePage.vue'
// 已有账号，重新进入需要登录 
// import loginwallt from './components/loginwallt/index.vue'
import create from './components/create/index.vue'
import creasteWalletPage from './components/creasteWalletPage/index.vue'
// import homePage from './components/homePage/index.vue'
import headerPage from './components/header/index.vue'
// import buyPage from './components/buyPage/index.vue'
// import assetsRecording from './components/assetsRecording/index.vue'
// import transfer from './components/transfer/index.vue'
import { getCookie } from '@/utils/index';
import indexDbData from '@/utils/indexDB';
import Web3 from 'web3'
import bus from '@/utils/bus';
const buyModal = ref(false)
const loading = ref(true)
const userAddress = ref(null)
const walltContent = ref(null)//账户相关信息
const pageTypes = ref('creasteWalletPage')//判断当前应该展示那个页面
const pagesArray = ref(['create', 'login', 'homePage', 'assetsRecording', 'sendTo', 'swap'])//页面地址数组,数组顺序为正常流程顺序
const openUrl = () => {
	// chrome.tabs.create({ url: 'background.html' });
}
onMounted(()=>{
	// getInfo()
})

const closeModal = (res) => {
	if (res == 'buyPage') buyModal.value = false;
	if (res == 'homePage') pageTypes.value = 'homePage';
}
const openModal = (res) => {
	if (res == 'buyPage') buyModal.value = true;
	if (res == 'swap') pageTypes.value = 'swap';
}

bus.on('nextPage', (res) => {
	console.log(res, 'rererere');

	pageTypes.value = res;
});
// 获取账户相关信息
const getInfo = () => {
	// 如果有当前用户信息，说明已经是生成钱包啦
	indexDbData.getData('currentWalltAddress').then(res => {
		console.log(res, 'res');
		if (!res) {
			pageTypes.value = 'create'
			loading.value = false;
			return;
		}
		let data = res;
		if (data && data.address) {
			if (getCookie('5ebe2294ecd0e0f08eab7690d2a6ee69') && getCookie('5ebe2294ecd0e0f08eab7690d2a6ee69') != 'false') {
				pageTypes.value = 'homePage';
			} else {
				pageTypes.value = 'login';
			}
			userAddress.value = data.address;
			walltContent.value = data.userName ? res.userName : '';
			getBlance()
		} else {
			pageTypes.value = 'create'
			loading.value = false;
		}
	}).catch(err => { })
}
const getBlance = () => {
	indexDbData.getData('rpc_url').then(res => {
		let data = res.content;
		// 定义rpc
		let web3 = new Web3(new Web3.providers.HttpProvider(data.url));
		walltContent.value = data;
		// 钱包地址
		walltContent.value.address = userAddress.value;
		// 获取钱包余额
		web3.eth.getBalance(userAddress.value)
			.then(res => {
				console.log(res);
				if (!res) {
					walltContent.value.balance = 0;
				} else {
					let balance = web3.utils.fromWei(res, 'ether');
					balance = String(balance).replace(/^(.*\..{4}).*$/, '$1');
					walltContent.value.balance = balance;
				}
				getHexHash()
			}).catch(err => {
				console.log(err, 'err');
				loading.value = false;
			});
	}).catch(err => { })
}
const getHexHash = () => {
	indexDbData.getData('txHash').then(res => {
		if (res) {
			// 转账记录
			walltContent.value.txHash = res.txHashList;
		}
		loading.value = false;
		// 测试
		setTimeout(() => {
			loading.value = false;
		}, 500)
	}).catch(err => { })
}
</script>

<style lang="less">
html {
	width: 360px !important;
	height: 600px !important;
}

.meer-wallt {
	width: 360px;
	height: 600px;
}
</style>

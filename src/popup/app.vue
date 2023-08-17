<template>
	<div class="meer-wallt">
		{{ pageTypes }}
		<!-- <div class="background_page_main" @click="openUrl()">
			this is background page main
		</div> -->
		<headerPage v-if="(pageTypes && pagesArray.indexOf(pageTypes) > 1)" :walltContent="walltContent" />
		<!-- 首次进入 -->
		<!-- <create v-if="!loading && pageTypes == 'create'" /> -->
		<!-- 输入密码 -->
		<loginwallt v-if="!loading && pageTypes == 'login'" />
		<!-- 主页 -->
		<homePage />
		<!-- 跳转购买页面 -->
		<!-- <buy-page @closeModal="closeModal" v-if="!loading && buyModal" /> -->
		<!-- 交易记录页面 -->
		<!-- <assetsRecording @nextPage="nextPage" v-if="!loading && pageTypes == 'assetsRecording'" :walltContent.value="walltContent.value" /> -->
		<!-- 转账页面 -->
		<!-- <send-to v-if="!loading && pageTypes == 'sendTo'" :walltContent.value="walltContent.value" @closeModal="closeModal"/> -->
		<!-- swap -->
		<!-- <swap-page @nextPage="nextPage" v-if="!loading && pageTypes == 'swap'"/> -->
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, provide, watch } from 'vue';
// 因为popup的特殊原因，此处只有一个入口，页面切换靠各种类型的判断
// import HomePage from '@/components/homePage.vue'
// 已有账号，重新进入需要登录 
import loginwallt from './components/loginwallt/index.vue'
import create from './components/create/index.vue'
import homePage from './components/homePage/index.vue'
import headerPage from './components/header/index.vue'
// import buyPage from './components/buyPage/index.vue'
// import assetsRecording from './components/assetsRecording/index.vue'
// import sendTo from './components/sendTo/index.vue'
// import swapPage from './components/swap/index.vue'
import { getCookie, setCookie, clearAllCookie } from '@/utils/index';
import indexDbData from '@/utils/indexDB';
import Web3 from 'web3'
import bus from '@/utils/bus';
const buyModal = ref(false)
const loading = ref(true)
const userAddress = ref(null)
const walltContent = ref(null)//账户相关信息
const pageTypes = ref('')//判断当前应该展示那个页面
const pagesArray = ref(['create', 'login', 'homePage', 'assetsRecording', 'sendTo', 'swap'])//页面地址数组,数组顺序为正常流程顺序

onMounted(() => {
	getInfo()
})
const openUrl = () => {
	chrome.tabs.create({ url: 'background.html' });
}
const closeModal = (res) => {
	if (res == 'buyPage') buyModal.value = false;
	if (res == 'homePage') pageTypes.value = 'homePage';
}
const openModal = (res) => {
	if (res == 'buyPage') buyModal.value = true;
	if (res == 'swap') pageTypes.value = 'swap';
}

bus.on('nextPage', (res) => {
	pageTypes.value = res;
});
// 获取账户相关信息
const getInfo = () => {
	// 当前用户信息
	indexDbData.getData('currentWalltAddress').then(res => {
		if (res && res.address) {
			if (getCookie('5ebe2294ecd0e0f08eab7690d2a6ee69') && getCookie('5ebe2294ecd0e0f08eab7690d2a6ee69') != 'false') {
				pageTypes.value = 'homePage';
			} else {
				pageTypes.value = 'login';
			}
			userAddress.value = res.address;
			walltContent.value.userName = res.userName ? res.userName : '';
			getBlance()
		} else {
			pageTypes.value = 'create'
			loading.value = false;
		}
	}).catch(err => { })
}
const getBlance = () => {
	indexDbData.getData('rpc_url').then(res => {
		// 定义rpc
		let web3 = new Web3(new Web3.providers.HttpProvider(res.url));
		// Vue.prototype.$web3 = web3;
		provide('web3', web3);
		// 指定钱包单位
		walltContent.value.balanceUnit = res.unit;
		walltContent.value.url = res.url;
		walltContent.value.CHAIN_ID = res.CHAIN_ID;
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
		// 测试
		setTimeout(() => {
			loading.value = false;
		}, 500)
	}).catch(err => { })
}
</script>

<style lang="less" scoped>
html {
	width: 305px !important;
	height: 530px !important;
}

.meer-wallt {
	width: 305px;
	height: 530px;
}
</style>
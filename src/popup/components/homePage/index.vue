<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, defineProps, nextTick } from 'vue';
import bus from '@/utils/bus.js';
import indexDbData from '@/utils/indexDB';
import Web3 from 'web3'
const transactionHash = ref(0);
const moreShow = ref(false);
const props = defineProps(['walltContent'])
const web3 = ref(null);
let walltContent = ref(null)
onMounted(() => {
	indexDbData.getData('rpc_url').then(res => {
		let data = res.content;
		// 定义rpc
		web3.value = new Web3(new Web3.providers.HttpProvider(data.url));
		getHash()
	})
})
const getHash = () => {
	walltContent.value = JSON.parse(JSON.stringify(props.walltContent))
	if (walltContent.value.txHash && walltContent.value.txHash.length > 1) {
		console.log(1111);

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
	// navigator.clipboard.writeText(walltContent.value.address);
	// $message.success('Copy Success!')
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

// 因为matemask与以太坊和web3高度集成，js部分没有什么参考价值
// 参考kaikas钱包对js的注入形式：1、初步判断应该是直接谷歌浏览器全局注册window.klaytn（因为我随便打开一个页面，只要之前没有唤起钱包，控制台直接使用这个直接可以唤起钱包，matemask则不行）
// 2、kaikas交易的一些方法也都暴露到控制台：new caver.klay
// 3、关于交易之类的，对比kaikas的方法，初步拟定：
// 		01、首先调用我们自己的钱包方法进行授权，然后通过web3生成对应的函数
// 		02、将该函数返回，让用户自己去手动调用剩下的方法
// 例如kaikas：
// 首先根据钱包暴露的方法，new出对应的合约信息
// artData.auctionContractInstance = new caver.klay.Contract(auctionABI, artData.auctionAddress);
// 然后根据返回的合约信息进行交易，其中safeBuyToken是钱包自定义方法，应该是经过钱包授权后钱包自行封装后的web3方法，返回的是web3关于交易的部分，通过钱包交易前半段是钱包自行授权return的方法，后半段完全就是由web3方法的操作部分
// artData.auctionContractInstance.methods.safeBuyToken(1, amount.value).send({}）
const toCreate = (res) => {
      // let createData = {
      //     url:'chrome-extension://kkhfpjkgnkckiofggkkiedpfjknmpemo/walltBackground.html?pageType=create',//打开的网页地址（即'http://www.google.com'，不是'www.google.com'）
      //     left:0,//新视窗相对于屏幕的左边缘的位置的像素值。如果没有指定，那么新的视窗从最后一个    有焦点的视窗自然偏移。
      //     top:0,//新视窗相对于屏幕的上边缘的位置的像素值。如果没有指定，那么新的视窗从最后一个有焦点的视窗自然偏移。
      //     width:560,//新视窗的像素宽度。如果没有指定，默认为自然宽度。
      //     height:500,//新视窗的像素高度。如果没有指定，默认为自然高度。
      //     type:"popup",// ( optional enumerated string ["normal", "popup"]可选，枚举字符串["normal", "popup"] ) 指定新建浏览器视窗的类型。
      //   }
      //   //打开一个浏览器
      //   chrome.windows.create(createData, ()=>{
      //     window.close();
      //     console.log('打开新页面')
      //   })
    //   if(!this.googleId) return;
    //   localStorage.setItem('googleId',this.googleId)
    //   window.open('chrome-extension://'+this.googleId+'/walltBackground.html?pageType='+res)
    }
</script>
<style lang="scss">
@import "./index.scss";
</style>
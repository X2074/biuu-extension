<template>
	<div class="background_page">
		this is background page
		<div class="background_page_main" @click="openUrl()">
			this is background page main
		</div>
	</div>
</template>

<script lang='ts' setup>
import { ref, onMounted, watchEffect, getCurrentInstance } from 'vue';
			console.log('打开新020页面')
	const openUrl = () => {
		console.log(chrome, 'chrome');
		chrome.tabs.create({ url: 'popup.html' });
	}
	// 监听来自注入脚本的消息
	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
			console.log('打开新页面')
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
			// window.close();
			console.log('打开新页面')
	})
	});
</script>

<style lang="less" scoped>
	.background_page{
		color: red;
		.background_page_main{
			color: green;
		}
	}
</style>
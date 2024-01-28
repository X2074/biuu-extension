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
	console.log(chrome, '打开新页面')
	const openUrl = () => {
		console.log(chrome, 'chrome');
		chrome.tabs.create({ url: 'popup.html' });
	}
	// 监听来自注入脚本的消息
	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		// let createData = {
		// 	url: 'chrome-extension://bjogegnhblmapbajppakikonghmglkkb/indexPage.html', //打开的网页地址（即'http://www.google.com'，不是'www.google.com'）
		// 	left: 0, //新视窗相对于屏幕的左边缘的位置的像素值。如果没有指定，那么新的视窗从最后一个    有焦点的视窗自然偏移。
		// 	top: 0, //新视窗相对于屏幕的上边缘的位置的像素值。如果没有指定，那么新的视窗从最后一个有焦点的视窗自然偏移。
		// 	width: 560, //新视窗的像素宽度。如果没有指定，默认为自然宽度。
		// 	height: 500, //新视窗的像素高度。如果没有指定，默认为自然高度。
		// 	type: 'popup' // ( optional enumerated string ["normal", "popup"]可选，枚举字符串["normal", "popup"] ) 指定新建浏览器视窗的类型。
		// }
		// //打开一个浏览器
		// chrome.windows.create(createData, () => {
		// 	// window.close();
		// 	console.log('打开新页面')
		// })
		
	// 右下角提示,这个id是唯一的，每次都不一样，否则不能触发
	chrome.notifications.create('assadsadsadasdsadas',
		{
		
			type: 'list',
			iconUrl: 'https://th.bing.com/th/id/R.9018c4f47b9796cbea207325cb60e457?rik=TKWy9KALYKcXBg&riu=http%3a%2f%2fpic.bizhi360.com%2fbbpic%2f92%2f1692.jpg&ehk=YB59358%2fCaARUufRoOEdKK9gWz%2fCdnQLXvP%2fn8DAPrA%3d&risl=&pid=ImgRaw&r=0',
			appIconMaskUrl: 'https://th.bing.com/th/id/R.9018c4f47b9796cbea207325cb60e457?rik=TKWy9KALYKcXBg&riu=http%3a%2f%2fpic.bizhi360.com%2fbbpic%2f92%2f1692.jpg&ehk=YB59358%2fCaARUufRoOEdKK9gWz%2fCdnQLXvP%2fn8DAPrA%3d&risl=&pid=ImgRaw&r=0',
			title: '通知主标题',
			message: '通知副标题',
			contextMessage: '好开心呀，终于会使用谷歌扩展里面的API了！', 
			buttons: [{title: '按钮1的标题', iconUrl: 'https://th.bing.com/th/id/R.9018c4f47b9796cbea207325cb60e457?rik=TKWy9KALYKcXBg&riu=http%3a%2f%2fpic.bizhi360.com%2fbbpic%2f92%2f1692.jpg&ehk=YB59358%2fCaARUufRoOEdKK9gWz%2fCdnQLXvP%2fn8DAPrA%3d&risl=&pid=ImgRaw&r=0'}, {title: '按钮2的标题', iconUrl: 'https://th.bing.com/th/id/R.9018c4f47b9796cbea207325cb60e457?rik=TKWy9KALYKcXBg&riu=http%3a%2f%2fpic.bizhi360.com%2fbbpic%2f92%2f1692.jpg&ehk=YB59358%2fCaARUufRoOEdKK9gWz%2fCdnQLXvP%2fn8DAPrA%3d&risl=&pid=ImgRaw&r=0'}],
			items: [{title: '消息1', message: '今天天气真好！'}, {title: '消息2', message: '明天天气估计也不错！'}],
			eventTime: Date.now() + 2000
		},
		(id) => {
			console.log(id);
		});
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
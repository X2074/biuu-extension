<template>
	<div class="background_page">
		this is background page
		<div class="background_page_main" @click="openUrl()">
			this is background page main
		</div>
	</div>
</template>

<script setup lang="ts">
	const openUrl = () => {
		console.log(chrome, 'chrome');
		chrome.tabs.create({ url: 'popup.html' });
	}
	console.log(1111111);
</script>

<style lang="less" scoped>
	.background_page{
		color: red;
		.background_page_main{
			color: green;
		}
	}
</style>
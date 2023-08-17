<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, inject } from 'vue';
import bus from '@/utils/bus.js';
const optionsBol = ref(true)
const options = ref([
	{
		url: 'images/homePage/zhanweifu.png',
		text: 'View Account on QITMEER',
		to: 'account'
	},
	{
		url: 'images/homePage/zhanweifu.png',
		text: 'Expand view',
		to: 'expand'
	},
	{
		url: 'images/homePage/zhanweifu.png',
		text: 'Account details',
		to: 'details'
	},
	{
		url: 'images/homePage/zhanweifu.png',
		text: 'Acticity',
		to: 'activity'
	},
	{
		url: 'images/homePage/zhanweifu.png',
		text: 'connected sites',
		to: 'sites'
	},
])
const optionType = ref('')
// 打开那个相关页面
bus.on('toModal', (res) => {
	toModal(res)
})
const toModal = (res) => {
	optionsBol.value = false;
	if (res == 'expand') {
		modalOperate();
		window.open('chrome-extension://' + localStorage.getItem('googleId') + '/walltBackground.html?pageType=userContent')
	}
	if (res == 'account') {
		alert('跳转到ateonscan首页')
	}
	if (res == 'activity') optionType.value = 'activity';
	if (res == 'details') optionType.value = 'details';
	if (res == 'private') optionType.value = 'private';
}
const modalOperate = () => {
	bus.emit('modalOperate', '')
}
</script>
<style lang="scss">
@import "./index.scss";
</style>
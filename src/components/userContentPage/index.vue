<template>
    <div>
        <index />
    </div>
</template>
<script lang='ts' setup>
import { ref, onMounted, watchEffect, getCurrentInstance } from 'vue';
import index from './index/index.vue'
	
	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		const { action, payload } = request;
		console.log(action, payload, 'background got!');
		sendResponse('background got!')
	})
</script>
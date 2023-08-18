<template>
    <!-- 生成钱包分两步
        1、生成助记词
        2、验证助记词
    -->
    <div class="create-wallt">
        <createMnemonic />
    </div>
</template>
<script lang='ts' setup>
import { ref, onMounted, watchEffect, getCurrentInstance } from 'vue';
import md5 from 'js-md5';
import indexDbData from '../../../utils/indexDB';
import Web3 from 'web3'
import bus from '../../../utils/bus.js';
import createMnemonic from './createMnemonic/index.vue'
const mnemonicList = ref([])//助记词数组
const newPsd = ref('')//钱包密码
const confirmPsd = ref('')//钱包密码
const newPsdBol = ref(false)
const confirmPsdBol = ref(false)
const useCheck = ref('n')//是否阅读条款
const walltInfo = ref(null)//钱包相关信息
const loading = ref(true)
const web3 = ref(new Web3())
const verifyBol = ref(false)
bus.on('mnemonicContent', (res) => {
    walltInfo.value = res;
})
onMounted(() => {
})
</script>
<template src="./index.html"></template>
<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import bus from '@/utils/bus';
import md5 from 'js-md5';
import Cookies from 'js-cookie';
import Web3 from 'web3';
const password = ref('');
const loading = ref(false);
const incorrect = ref(false);
const address = ref('');
const passKey = ref('');
const login = () => {
    bus.emit('nextPage', 'homePage');
    incorrect.value = false;
    if (!password.value || password.value.length < 8) {
        incorrect.value = true;
    }
    if (md5(password.value) == passKey.value) {
        setCookie();
        // 下一页
        bus.emit('nextPage', 'homePage');
    } else {
        incorrect.value = true;
    }
}
const setCookie = () => {
    // localStorage.setItem('5ebe2294ecd0e0f08eab7690d2a6ee69',googleId)
    Cookies.set('5ebe2294ecd0e0f08eab7690d2a6ee69', password.value)
}
</script>
<style lang="scss">
@import "./index.scss";
</style>
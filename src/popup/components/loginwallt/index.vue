<template src="./index.html"></template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import bus from '@/utils/bus';
import md5 from 'js-md5';
import Cookies from 'js-cookie';
import indexDbData from '@/utils/indexDB';
const password = ref('');
const loading = ref(false);
const incorrect = ref(false);
const address = ref('');
const passKey = ref('');
onMounted(() => {
    // 获取密码
    indexDbData.getData('5ebe2294ecd0e0f08eab7690d2a6ee69').then(res => {
        passKey.value = res.secret;
    }).catch(err => { })
})
const login = () => {
    incorrect.value = false;
    if (!password.value) {
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
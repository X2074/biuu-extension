<template src="./index.html"></template>
<script lang="ts">
export default {
    name: 'setPsd'
};
</script>
<script lang="ts" setup>
import { ref } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus.js';
import md5 from 'js-md5';
import { useRouter } from 'vue-router';
let router = useRouter();
let newPsd = ref(''); //钱包密码
let confirmPsd = ref(''); //钱包密码
let newPsdBol = ref(false); //钱包错误校验
let confirmPsdBol = ref(false); //二次确认校验
let readeTip = ref(false); //是否阅读

// 生成keystory文件
const creatKeyStory = () => {
    newPsdBol.value = false;
    confirmPsdBol.value = false;
    if (!newPsd.value || newPsd.value.length < 8) {
        newPsdBol.value = true;
        confirmPsd.value = '';
        return;
    }
    if (!confirmPsd.value) {
        confirmPsdBol.value = true;
        return;
    }
    if (newPsd.value != confirmPsd.value) {
        confirmPsdBol.value = true;
        return;
    }
    console.log(readeTip.value);
    if (!readeTip.value) {
        return;
    }
    console.log(md5('secret'), md5(newPsd.value));

    // 存储密码
    indexDbData.putData({
        id: md5('secret'),
        secret: md5(newPsd.value)
    });
    setTimeout(() => {
        bus.emit('nextCreatePage', 'createMnemonic');
    }, 500);
};
const changeStep = () => {
    router.push('/create');
};
</script>
<style lang="scss">
@import './index.scss';
</style>

<template src='./index.html'></template>
<script lang="ts">
export default {
    name: "setPsd",
};
</script>
<script lang='ts' setup>
import { ref, onMounted } from "vue";
import indexDbData from "@/utils/indexDB.js";
import bus from "@/utils/bus.js";
import md5 from "js-md5";
let newPsd = ref(""); //钱包密码
let confirmPsd = ref(""); //钱包密码
let newPsdBol = ref(false);
let confirmPsdBol = ref(false);
let readeTip = ref(false); //是否阅读
let phrasesPrivate = ref(false);

onMounted(() => {
    // 获取设置的密码
    indexDbData
        .getData(md5("secret"))
        .then((res: any) => {
            if (res) {
                phrasesPrivate.value = true;
            }
        })
        .catch((err: any) => {
            console.log(err);
        });
});
// 生成keystory文件
const creatKeyStory = () => {
    newPsdBol.value = false;
    confirmPsdBol.value = false;
    if (!newPsd.value || newPsd.value.length < 8) {
        newPsdBol.value = true;
        confirmPsd.value = "";
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
    if (!readeTip.value) return;
    console.log(md5("secret"), md5(newPsd.value));

    // 存储密码
    indexDbData.putData({
        id: md5("secret"),
        secret: md5(newPsd.value),
    });
    setTimeout(() => {
        phrasesPrivate.value = true;
    }, 500);
};
const toPage = (res: any) => {
    bus.emit("importWalletPage", res);
};
</script>
<style lang='scss'>
@import "./index.scss";
</style>
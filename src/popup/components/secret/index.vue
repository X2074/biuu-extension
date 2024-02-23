
<template src="./index.html"></template>
<script lang="ts" setup>
import { ref, onMounted, reactive, watch } from 'vue';
const googleId = ref('fkhnghcgmjcgeniccpjpmlfpgbibmmge')
import bus from '@/utils/bus';
import indexDbData from '@/utils/indexDB';
import md5 from 'js-md5';
let textPsd = ref('psd')
let psdText = ref('')
let newPsdBol = ref(false)
let secretStep = ref(2)
let passKey = ref('')
onMounted(()=>{
    // 获取设置的密码
	indexDbData.getData(md5('secret')).then(res => {
		passKey.value = res.secret;
	}).catch(err => { })
})
const forget = ()=>{
    secretStep.value = 2;
}

const unlock = ()=>{
    if (!psdText.value || psdText.value.length < 8) {
        newPsdBol.value = true;
        confirmPsd.value = '请输入至少 8 位密码';
        return;
    }
    if(passKey.value != md5(psdText.value)){
        newPsdBol.value = true;
        confirmPsd.value = '您输入的密码有误';
        return;
    }

}
</script>
<style lang="scss">
@import "./index.scss";
</style>
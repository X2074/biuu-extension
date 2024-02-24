
<template src="./index.html"></template>
<script lang="ts" setup>
import { ref, onMounted, reactive, watch } from 'vue';
const googleId = ref('fkhnghcgmjcgeniccpjpmlfpgbibmmge')
import bus from '@/utils/bus';
import indexDbData from '@/utils/indexDB';
import { Encrypt, Decrypt } from '@/utils/index.js';
import md5 from 'js-md5';
let textPsd = ref('psd')
let psdText = ref('')
let newPsdBol = ref(false)
let secretStep = ref(1)
let passKey = ref('')
let mnemonicPhrase = ref('');//助记词
let mnemonicPhraseBol = ref('')
let confirmPsd = ref('')
// 修改密码
// 密码
let psdNewText = ref('')
let psdConText = ref('')
// 是否显示明文
let textNewPsd = ref('psd')
let textConPsd = ref('psd')
// 错误提示
let conNewfirmPsd = ref('')
let conConfirmPsd = ref('')
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

// 匹配钱包的助记词
const matchingWallt = ()=>{
    if(!mnemonicPhrase.value){
        mnemonicPhraseBol.value = '请输入助记词';
        return;
    };
	indexDbData.getData('keyStore').then(res => {
		console.log(res);
		// 第二个参数为密码，后期改为获取数据库密码或者是用户输入
		let encryption = Decrypt(res.secret, passKey.value);
		console.log(encryption,'encryption');
		if(encryption != mnemonicPhrase.value){
            mnemonicPhraseBol.value = '助记词不正确';
            return;
        }else{
            mnemonicPhraseBol.value = '';
            secretStep.value = 4;
        }
	})
}
// 恢复钱包
const restoreWallet = ()=>{
    conNewfirmPsd.value = '';
    conConfirmPsd.value = '';
    if(!psdNewText.value || psdNewText.value.length < 8){
        conNewfirmPsd.value = "请输入8位数密码";
        return;
    }
    if(!psdConText.value || psdConText.value.length < 8){
        conConfirmPsd.value = "请输入8位数密码";
        return;
    }
    if(psdNewText.value != psdConText.value){
        conConfirmPsd.value = "请再次确认密码";
        return;
    }
	
	chrome.runtime.sendMessage({ action: 'setSecret',data:md5(psdNewText.value) });
    
    // 存储密码
    indexDbData.putData({
        id: md5('secret'),
        secret: md5(psdNewText.value)
    })
    
    bus.emit('nextPage','homePage');
}
</script>
<style lang="scss">
@import "./index.scss";
</style>
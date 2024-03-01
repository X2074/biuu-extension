
<template src="./index.html"></template>
<script lang="ts" setup>
import { ref, onMounted, reactive, watch } from 'vue';
import bus from '@/utils/bus';
import indexDbData from '@/utils/indexDB';
import { Encrypt,Decrypt } from '@/utils/index.js';
import md5 from 'js-md5';
let psdText = ref('')
let passKey = ref('')
// 修改密码
// 密码
let psdNewText = ref('')
let psdConText = ref('')
// 是否显示明文
let textNewPsd = ref('psd')
let textConPsd = ref('psd')
onMounted(async()=>{
    // 获取设置的密码
	indexDbData.getData(md5('secret')).then(res => {
		passKey.value = res.secret;
	}).catch(err => { })
})
// 修改密码
const restoreWallet = async()=>{
    if(!psdNewText.value || psdNewText.value.length < 8){
        bus.emit('promptModalErr','请输入8位数密码')
        return;
    }
    if(psdNewText.value != psdConText.value){
        bus.emit('promptModalErr','请再次确认密码')
        return;
    }
	chrome.runtime.sendMessage({ action: 'setSecret',data:md5(psdNewText.value) });
    
    // 存储密码
    indexDbData.putData({
        id: md5('secret'),
        secret: md5(psdNewText.value)
    })
    
    // 获取所有的密钥
    let data = await indexDbData.getData('keyStore');
    let promises = [];
    // 更新所有助记词密码
    for (let key in data['secret']) {
        // 解密助记词
        let mnemonic = await Decrypt(data['secret'][key], passKey.value)
        console.log(mnemonic,'mnemonic');
        // 助记词加密
        let ciphertext = await Encrypt(mnemonic, md5(psdNewText.value));
        console.log(mnemonic02,'mnemonic02');
        
        data['secret'][key] = ciphertext;
    }
    indexDbData.putData(data);
    console.log(data,'datadata');
    bus.emit('promptModalSuccess','密码修改成功')
    bus.emit('settingPage','options')
}
</script>
<style lang="scss">
@import "./index.scss";
</style>
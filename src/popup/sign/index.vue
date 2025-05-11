<style lang="scss" scoped>
@import './index.scss';
</style>
<template src="./index.html">

</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, toRaw } from 'vue';
import indexDbData from '../../utils/indexDB';
import { Decrypt, getGas, evmKey, utxoKey, getBlance } from '@/utils/index';
import md5 from 'js-md5';
import { ethers } from 'ethers';
const message = ref('');
const address = ref('');
const origin = ref('');
let passKey = ref('');
let privateKey: any = ref(null)
let authorization:any = ref({});
onMounted(async()=>{ 
  authorization.value = await indexDbData.getData('authorization');
  indexDbData
  .getData(md5('secret'))
  .then((res: any) => {
    passKey.value = res.secret;
  })
  .catch((err: any) => {
    console.log(err);
  });
    const hash = window.location.hash.substring(1); // 去掉 #
    const paramsString = hash.substring(hash.indexOf('?') + 1);
const urlParams:any = new URLSearchParams(paramsString)
    console.log(urlParams,"urlParams");
    // if (message.value.startsWith('0x')) {
      // 如果是16进制，尝试解码
      try {
        // 去掉0x前缀
        const hex:any = urlParams.get('message').slice(2);
        // 将16进制转换为字节数组
        const bytes = new Uint8Array(hex.match(/.{1,2}/g)?.map((byte:any) => parseInt(byte, 16)));
        // 将字节数组转换为字符串
        message.value = new TextDecoder().decode(bytes);
      } catch (error) {
        console.log('Failed to decode hex message, using original:', error);
        message.value = message.value;
      }
    // }
  // message.value = urlParams.get('message') || '';
  address.value = urlParams.get('address') || '';
  origin.value = urlParams.get('origin') || '';
})

const reject = ()=>{
    let data: any = { action: 'signature_response', error: 'User rejected the request' };
    chrome.runtime.sendMessage(data, (response: any) => {
        console.log(response,"response");
        window.close();
    });

}
const sign = async()=>{
    // let data: any = { action: 'authorization_response', approved: true };
    // chrome.runtime.sendMessage(data, (response: any) => {
    //     console.log(response,"response");
    //     window.close();
    // });
    try {
    // 从 IndexedDB 获取私钥
  let currentWallt = await indexDbData.getData('currentWalltAddress');
  let data = await indexDbData.getData('keyStore');
  let key = toRaw(data.secret[currentWallt['keyStore']]);
  // 如果账户是私钥导入的，就直接赋值私钥
  // 907fd84538e3ac1caebdbbd35b00cad93986ee9ae34785e99e62843020c98f72
  let encryption = await Decrypt(key, passKey.value);
   console.log(encryption,"encryption");
    if (currentWallt['keyStoreType'] && currentWallt['keyStoreType'] == 'privateKey') {
    privateKey.value = { privateKey: encryption };
  } else {
    // if (rpcUrlData.value['netWorkType'].toLowerCase() == 'evm') {
      privateKey.value = await evmKey(encryption);
    // } else {
    //   privateKey.value = await utxoKey(encryption);
    // }
  }
  console.log(privateKey.value['privateKey'],"privateKey.value");
  
    // const userPrivateKey = privateKey[address.value];
    
    // if (!userPrivateKey) {
    //   throw new Error('No private key found for this address');
    // }

    // 使用 web3.js 或 ethers.js 进行签名
    // 这里使用 ethers.js 作为示例
    const wallet = new ethers.Wallet(privateKey.value['privateKey']);
    const signature = await wallet.signMessage(message.value);
    // 0x14b75d96a426ff726a8b69f2372eefc5922f4400f98acbb16e0e01fa7b726e1e6bcb8acf1e2addd9386c62983786e7e8d4a4147149d7b1e03a2d82f99d446b551c
console.log(signature,  'signature');
    // 发送签名结果
    chrome.runtime.sendMessage({
      action: 'signature_response',
      signature
    });
    // window.close();
  } catch (error:any) {
    console.error('Sign error:', error);
    chrome.runtime.sendMessage({
      action: 'signature_response',
      error: error.message
    });
    // window.close();
  }
}
</script>

<template src="./index.html"></template>
<script lang="ts" >
export default {
  name: 'secret'
};
</script>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import bus from '@/utils/bus.js';
import indexDbData from '@/utils/indexDB.js';
import md5 from 'js-md5';
import { Encrypt, Decrypt,showExtensionPopup } from '@/utils/index';
let textPsd = ref('psd');
let psdText = ref('');
let newPsdBol = ref(false);
let secretStep = ref(1);
let passKey = ref('');
let mnemonicPhrase = ref(''); //助记词
let mnemonicPhraseBol = ref('');
let confirmPsd = ref('');
// 修改密码
// 密码
let psdNewText = ref('');
let psdConText = ref('');
// 是否显示明文
let textNewPsd = ref('psd');
let textConPsd = ref('psd');
// 错误提示
let conNewfirmPsd = ref('');
let conConfirmPsd = ref('');
onMounted(() => {
  // 获取设置的密码
  indexDbData
    .getData(md5('secret'))
    .then((res: any) => {
      passKey.value = res.secret;
    })
    .catch(() => {});
});
const forget = () => {
  secretStep.value = 2;
};

const unlock = async () => {
  if (!psdText.value || psdText.value.length < 8) {
    newPsdBol.value = true;
    confirmPsd.value = '请输入至少 8 位密码';
    return;
  }
  if (passKey.value != md5(psdText.value)) {
    newPsdBol.value = true;
    confirmPsd.value = '您输入的密码有误';
    return;
  }
  // 发送消息给 background 页面请求数据
  chrome.runtime.sendMessage({ action: 'setSecret', text: md5(psdText.value) });
  bus.emit('nextPage', 'homePage');
};

// 匹配钱包的助记词
const matchingWallt = () => {
  if (!mnemonicPhrase.value) {
    mnemonicPhraseBol.value = '请输入助记词';
    return;
  }
  indexDbData.getData('keyStore').then((res: any) => {
    console.log(res);
    // 第二个参数为密码，后期改为获取数据库密码或者是用户输入
    let encryption = Decrypt(res.secret, passKey.value);
    console.log(encryption, 'encryption');
    if (encryption != mnemonicPhrase.value) {
      mnemonicPhraseBol.value = '助记词不正确';
      return;
    } else {
      mnemonicPhraseBol.value = '';
      secretStep.value = 4;
    }
  });
};
// 恢复钱包
const restoreWallet = async () => {
  conNewfirmPsd.value = '';
  conConfirmPsd.value = '';
  if (!psdNewText.value || psdNewText.value.length < 8) {
    conNewfirmPsd.value = '请输入8位数密码';
    return;
  }
  if (!psdConText.value || psdConText.value.length < 8) {
    conConfirmPsd.value = '请输入8位数密码';
    return;
  }
  if (psdNewText.value != psdConText.value) {
    conConfirmPsd.value = '请再次确认密码';
    return;
  }

  chrome.runtime.sendMessage({ action: 'setSecret', data: md5(psdNewText.value) });

  // 存储密码
  indexDbData.putData({
    id: md5('secret'),
    secret: md5(psdNewText.value)
  });
  // 获取所有的密钥
  let data = await indexDbData.getData('keyStore');
  // 更新所有助记词密码
  for (let key in data['secret']) {
    // 解密助记词
    let mnemonic = await Decrypt(data['secret'][key], passKey.value);
    console.log(mnemonic, 'mnemonic');
    // 助记词加密
    let ciphertext = await Encrypt(mnemonic, md5(psdNewText.value));

    data['secret'][key] = ciphertext;
  }
  indexDbData.putData(data);

  bus.emit('nextPage', 'homePage');
};


// async function toDapp() {
//     try {
//         // 获取当前激活的标签页
//         const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
//         if (!tab?.id) {
//             throw new Error('No active tab found');
//         }

//         // 发送消息到 content script
//         const response = await chrome.tabs.sendMessage(tab.id, {
//             action: 'accounts_selected',
//             data: {
//                 accounts: ['0x1234567890abcdef'], // 实际使用时应替换为真实的账户地址
//                 selectedAccount: "0x1234567890abcdef" // 选择的账户
//             }
//         });

//     } catch (error) {
//         console.error('Failed to communicate with content script:', error);
//         throw error;
//     }
// }

async function toDapp() {
  try {
    // 获取当前激活的标签页
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//         if (!tab?.id) {
//             throw new Error('No active tab found');
//         }
        // 创建到后台的端口连接
        
        let data:any = {name:'biuu-external'};
        const port = chrome.runtime.connect(data);
        // 发送消息到DApp
        port.postMessage({
          action: 'send_to_dapp',
          data: {
            accounts: ['0x1234567890abcdef'],
            selectedAccount: '0x1234567890abcdef',
            message: 'Hello from popup window',
            tab:tab
          }
        });
        
        // 添加消息监听器
        port.onMessage.addListener((response) => {
          console.log('Response from content script:', response);
        });
        
        // 添加断开连接的监听器
        port.onDisconnect.addListener(() => {
          console.log('Port disconnected');
        });
        
      } catch (error) {
        console.error('Failed to send message:', error);
      }
}
</script>
<style lang="scss">
@import './index.scss';
</style>
<template>
  <div class="meer-wallt" v-loading:[loadingText]="loading">
    <!-- 首次进入 -->
    <!-- <create v-if="pageTypes == 'create'" /> -->
    <!-- 输入密码页面 -->
    <!-- <secret v-if="pageTypes == 'secret'" /> -->
    <!-- 创建钱包 -->
    <!-- <creasteWalletPage v-if="pageTypes == 'creasteWallet'" /> -->
    <!-- 导入钱包 -->
    <!-- <importWallet v-if="pageTypes == 'importWallet'" /> -->
    <!-- 输入密码 -->
    <!-- <loginwallt v-if="pageTypes == 'login'" /> -->
    <!-- 主页 -->
    <!-- <homePage :walltContent="walltContent" v-if="pageTypes == 'homePage'" /> -->
    <!-- 转账页面 -->
    <!-- <transfer v-if="pageTypes == 'sendTo'" :walltContent="walltContent" /> -->
    <router-view></router-view>
  </div>

  <!-- 全局自动关闭提示 -->
  <prompt></prompt>
</template>
<script lang="ts">
export default {
  name: 'App'
};
</script>
<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import md5 from 'js-md5';
// 因为popup的特殊原因，此处只有一个入口，页面切换靠各种类型的判断
// import homePage from '@/components/homePage.vue'
// 已有账号，重新进入需要登录
//import loginwallt from './components/loginwallt/index.vue';
// import create from './components/create/index.vue';
// import secret from './components/secret/index.vue';
// import creasteWalletPage from './components/creasteWalletPage/index.vue';
// import importWallet from '@/components/popup/components/importWallet/index.vue';
// import homePage from './components/homePage/index.vue';
// import transfer from './components/transfer/index.vue';
// 全局提示
import prompt from '@/components/prompt/index.vue';
import { getBlance } from '@/utils/index';
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus.js';
import { useRouter } from 'vue-router';
let loading = ref(true);
let loadingText = ref('加载中...');
const userAddress = ref(null);
const walltContent: any = ref(null); //账户相关信息
let currentWallt = ref(null); //当前账户
const pageTypes = ref(''); //判断当前应该展示那个页面
let router = useRouter();
onMounted(async () => {
  // 获取设置的密码
  // let secert = await indexDbData.getData(md5('secret'));
  // // 发送消息给 background 页面请求数据
  // let data: any = { action: 'getSecret' };
  // chrome.runtime.sendMessage(data, (response: any) => {
  //   // 获取缓存的密码，浏览器关闭，删除缓存数据
  //   if (!response.secret) {
  loading.value = false;
  //     if (secert && secert.secret) {
  //       pageTypes.value = 'secret';
  //     } else {
  //       pageTypes.value = 'create';
  //     }
  //   } else {
  //     getInfo();
  //   }
  // });
});
// 监听数据变化，跳转相应页面
watch(pageTypes, (newV) => {
  if (newV == 'sendTo') {
    router.push('/transfer');
  } else {
    router.push('/' + newV);
  }
});

bus.on('nextPage', (res: any) => {
  console.log(res, 'rererere');
  pageTypes.value = '';
  loading.value = true;
  if (res == 'homePage' || !res) {
    getInfo();
  } else {
    pageTypes.value = res;
    loading.value = false;
  }
});
const getBlanceInfo = async (type = 'homePage') => {
  try {
    let data = await indexDbData.getData('rpc_url');
    walltContent.value = data;
    // 钱包地址
    walltContent.value.address = userAddress.value;
    console.log(11111, data);

    walltContent.value.blance = await getBlance(
      data.url,
      Object.assign({ netWorkType: data.netWorkType }, currentWallt.value)
    );
    console.log(walltContent.value, 'walltContent.value');

    pageTypes.value = type;
    loading.value = false;
  } catch (error) {
    pageTypes.value = type;
    loading.value = false;
  }
};
// 获取账户相关信息
const getInfo = () => {
  // 如果有当前用户信息，说明已经是生成钱包啦
  indexDbData
    .getData('currentWalltAddress')
    .then((res: any) => {
      console.log(res, 'res');
      if (!res) {
        pageTypes.value = 'create';
        loading.value = false;
        return;
      }
      if (res && res.address) {
        userAddress.value = res.utxoAddressTest || res.address;
        currentWallt.value = res;
        getBlanceInfo();
      } else {
        pageTypes.value = 'create';
        loading.value = false;
      }
    })
    .catch(() => {
      loading.value = false;
    });
};
</script>

<style lang="less">
html {
  width: 360px !important;
  //height: 600px !important;
}

.meer-wallt {
  width: 360px;
  height: 600px;
  background: #f8f9fa;
}
</style>

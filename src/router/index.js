import { createRouter, createWebHashHistory } from 'vue-router'
import homePage from '../popup/components/homePage/index.vue'
import loginwallt from '../popup/components/loginwallt/index.vue'
import create from '../popup/components/create/index.vue'
import secret from '../popup/components/secret/index.vue'
import creasteWalletPage from '../popup/components/creasteWalletPage/index.vue'
import importWallet from '@/components/popup/components/importWallet/index.vue'
import transfer from '../popup/components/transfer/index.vue'

const routes = [
  { path: '/:pathMath(.*)', redirect: '/homePage' },
  {
    path: '/',
    name: '',
    redirect: '/create',
  },
  {
    path: '/homePage',
    name: 'homePage',
    component: homePage
  },
  {
    path: '/create',
    name: 'create',
    component: create
  },
  {
    path: '/secret',
    name: 'secret',
    component: secret
  },
  {
    path: '/creasteWallet',
    name: 'creasteWallet',
    component: creasteWalletPage
  },
  {
    path: '/importWallet',
    name: 'importWallet',
    component: importWallet
  },
  {
    path: '/login',
    name: 'login',
    component: loginwallt
  },
  {
    path: '/transfer',
    name: 'transfer',
    component: transfer
  },
  // 钱包切换
  {
    path: '/selectAccount/:pageType?',
    name: 'selectAccount',
    component: () => import("@/components/popup/homePage/selectAccount/index/index.vue"),
  },
  // 设置
  {
    path: '/setting',
    name: 'setting',
    component: () => import("@/components/popup/homePage/setting/index.vue"),
  },
  // 网络切换
  {
    path: '/networkSwitching',
    name: 'networkSwitching',
    component: () => import("@/components/popup/homePage/networkSwitching/index.vue"),
  },
  // 新增网络
  {
    path: '/addNetwork',
    name: 'addNetwork',
    component: () => import("@/components/popup/homePage/addNetwork/index.vue"),
  },
  // 导入nft
  {
    path: '/importNfts',
    name: 'importNfts',
    component: () => import("@/components/popup/homePage/nfts/importNfts/index.vue"),
  },
  // nft详情
  {
    path: '/nftDetail',
    name: 'nftDetail',
    component: () => import("@/components/popup/homePage/nfts/nftDetail/index.vue"),
  },
  // 交易记录
  {
    path: '/transactionHistory',
    name: 'transactionHistory',
    component: () => import("@/components/popup/homePage/transactionHistory/index.vue"),
  },
  // 转账
  {
    path: '/sendTrade',
    name: 'sendTrade',
    component: () => import("@/components/popup/homePage/sendTrade/index.vue"),
  },
  // 划转
  {
    path: '/transfer/:type?',
    name: 'transfer',
    component: () => import("@/components/popup/homePage/sendTrade/index.vue"),
  },

]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
// 全局前置守卫 按照创建顺序调用 守卫是异步执行的

export default router

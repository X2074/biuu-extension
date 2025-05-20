import { createRouter, createWebHashHistory } from 'vue-router'
// 首页
import homePage from '../popup/homePage/index.vue'
// 登录
import loginwallt from '../popup/loginwallt/index.vue'
// 创建
import create from '../popup/create/index.vue'
// 密钥
import secret from '../popup/secret/index.vue'
// 创建钱包
import creasteWalletPage from '../popup/creasteWalletPage/index.vue'
// 导入
import importWallet from '../popup/importWallet/index.vue'
// 转账
// import transfer from '../popup/transfer/index.vue'

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
  // {
  //   path: '/transfer',
  //   name: 'transfer',
  //   component: transfer
  // },
  // 钱包切换
  {
    path: '/selectAccount/:pageType?',
    name: 'selectAccount',
    component: () => import("../popup/selectAccount/index/index.vue"),
  },
  // 设置
  {
    path: '/setting',
    name: 'setting',
    component: () => import("../popup/setting/index.vue"),
  },
  // 网络切换
  {
    path: '/networkSwitching',
    name: 'networkSwitching',
    component: () => import("../popup/networkSwitching/index.vue"),
  },
  // 新增网络
  {
    path: '/addNetwork',
    name: 'addNetwork',
    component: () => import("../popup/addNetwork/index.vue"),
  },
  // 导入nft
  {
    path: '/importNfts',
    name: 'importNfts',
    component: () => import("../popup/nfts/importNfts/index.vue"),
  },
  // nft详情
  {
    path: '/nftDetail',
    name: 'nftDetail',
    component: () => import("../popup/nfts/nftDetail/index.vue"),
  },
  // 交易记录
  {
    path: '/transactionHistory',
    name: 'transactionHistory',
    component: () => import("../popup/transactionHistory/index.vue"),
  },
  // 转账
  {
    path: '/sendTrade',
    name: 'sendTrade',
    component: () => import("../popup/sendTrade/index.vue"),
  },
  //授权
  {
    path: '/connect',
    name: 'connect',
    component: () => import("../popup/dappRequest/connect/index.vue"),
  },
  //签名
  {
    path: '/sign',
    name: 'sign',
    component: () => import("../popup/dappRequest/sign/index.vue")
  },
  //新增网络
  {
    path: '/addEthereumChain',
    name: 'addEthereumChain',
    component: () => import("../popup/dappRequest/addEthereumChain/index.vue")
  },
  
  //添加代币
  {
    path: '/watchAsset',
    name: 'watchAsset',
    component: () => import("../popup/dappRequest/watchAsset/index.vue")
  }

]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
// 全局前置守卫 按照创建顺序调用 守卫是异步执行的

export default router

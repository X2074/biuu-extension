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
    redirect: '/homePage',
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
  }

]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
// 全局前置守卫 按照创建顺序调用 守卫是异步执行的

export default router

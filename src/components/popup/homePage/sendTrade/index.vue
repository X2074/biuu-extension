
<template src='./index.html'></template>
<style scoped lang='scss'>
@import './index.scss';
</style>
<script lang='ts' setup>
import { ref, onMounted, toRaw } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus';
import { getBlance, getNonce, getGas, Decrypt, evmKey } from '@/utils/index';
import addressBook from '../addressBook/index.vue'
import transfer from './transfer/index.vue'
import md5 from 'js-md5';
let settingStep = ref('options');//设置页面当前展示内容
let currentWallt = ref({
    address:''
})//当前钱包信息
let sendTradePage = ref('home');//当前转账页面显示内容
let quantity = ref('1');//转账数量
let confirmPsd = ref('');//密码
let blanceSecre = ref(0);//余额
let toAddress = ref('');//付款地址
let nonce = ref(0);//交易nonce
let rpcUrlData = ref(null)
let transferContent = ref(null);//转账内容
let privateKey = ref(null);//私钥
let passKey = ref('')
let loading = ref(false)
let loadingText = ref('加载中...')
indexDbData.getData('currentWalltAddress').then(res => {
    currentWallt.value = res;
})
let rpcData = ref(null)//当前网络信息
indexDbData.getData('rpc_url').then(res => {
    rpcData.value = res;
})
// 获取设置的密码
indexDbData.getData(md5('secret')).then(res => {
    passKey.value = res.secret;
}).catch(err => { })
onMounted(async()=>{
    // 获取钱包余额
    rpcUrlData.value = await indexDbData.getData('rpc_url')
    try {
        // 钱包地址
        blanceSecre.value = await getBlance(rpcUrlData.value.url,currentWallt.value['address'])
        console.log(blanceSecre.value,'转账',sendTradePage.value);
    } catch (error) {
    }
})
// 返回上一页面
const toBack = (page)=>{
    if(sendTradePage.value == 'home'){
        bus.emit('nextPage','');
    }else{
        sendTradePage.value = 'home';
    }
}
// 获取子组件传递的地址信息
bus.on('sendTradeBook',(data:any)=>{
    console.log(data);
    toAddress.value = data.address;
    sendTradePage.value = 'home';
})
// 只能输入数字
const validateNumberInput = ()=>{
    quantity.value = quantity.value.replace(/[^0-9.]/g, '');
}
// 跳转转账页面
const toTransfer = async ()=>{
    // if(!currentWallt.value['address']){
    //     bus.emit('promptModalErr','请选择付款地址')
    //     return;
    // }
    // if(!confirmPsd.value){
    //     bus.emit('promptModalErr','请输入密码')
    //     return;
    // }
    // if(md5(confirmPsd.value) != passKey.value){
    //     bus.emit('promptModalErr','您输入的密码有误')
    //     return;
    // }
    // if(md5(confirmPsd.value) != passKey.value){
    //     bus.emit('promptModalErr','您输入的密码有误')
    //     return;
    // }
    // if(!quantity.value || !Number(quantity.value * 1)){
    //     bus.emit('promptModalErr','请输入正确的转账数量')
    //     return;
    // }
    // if(!toAddress.value){
    //     bus.emit('promptModalErr','请选择收款地址')
    //     return;
    // }
    loading.value = true;
    nonce.value = await getNonce(currentWallt.value['address'],rpcUrlData.value['url']);
    let gas = await getGas(rpcUrlData.value['url'],currentWallt.value['address'],toAddress.value,quantity.value);
    console.log(gas,'gasgasgasgas');
    
    // 获取当前的助记词
    let data = await indexDbData.getData('keyStore')
    console.log(data,'data');
    let key = data.secret[currentWallt.value['keyStore']];
    // 如果账户是私钥导入的，就直接赋值私钥
    let encryption = await Decrypt(key, passKey.value)
    if(currentWallt.value['keyStoreType'] == 'privateKey'){
        privateKey.value = encryption;
    }else{
        // 解密助记词
        console.log(encryption,'encryption');
        // 只有evm有nft交易
        privateKey.value = await evmKey(encryption)
    }
    console.log(key,'key');
    loading.value = false;
    transferContent.value = {
        sendAddress:toAddress.value,// 接收方地址
        value:quantity.value,// 转账 wei
        nonce:nonce.value,
        chainId:rpcUrlData.value['CHAIN_ID'],
        gasLimit:gas.gasLimit,
        gasPrice:gas.gasPrice,
        key:privateKey.value
    }
    console.log(toRaw(transferContent.value),'transferContent.value');
    
}
</script>
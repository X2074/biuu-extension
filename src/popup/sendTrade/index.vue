<template src="./index.html"></template>
<script lang="ts">
export default {
    name: 'sendTrade'
};
</script>
<style scoped lang="scss">
@import './index.scss';
</style>
<script lang="ts" setup>
import { ref, onMounted, toRaw, defineProps } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus';
import { Decrypt, getGas, evmKey, utxoKey, getBalance } from '@/utils/index';
import addressBook from '@/components/addressBook/index.vue';
import transfer from './transfer/index.vue';
import md5 from 'js-md5';
const props = defineProps(['type']);
let currentWallt: any = ref(null); //当前钱包信息
let sendTradePage = ref('home'); //当前转账页面显示内容
let quantity: any = ref('1'); //转账数量
let confirmPsd = ref(''); //密码
let balanceSecre: any = ref(0); //余额
let toAddress = ref(''); //付款地址
let nonce = ref(0); //交易nonce
let rpcUrlData: any = ref(null);
let transferContent: any = ref(null); //转账内容
let privateKey: any = ref(null); //私钥
let passKey = ref('');
let loading = ref(false);
let loadingText = ref('加载中...');
let rpcData = ref(null); //当前网络信息
indexDbData.getData('rpc_url').then((res: any) => {
    rpcData.value = res;
});
let utxoTactics = ref('min');
// 获取设置的密码
indexDbData
    .getData(md5('secret'))
    .then((res: any) => {
        passKey.value = res.secret;
    })
    .catch((err: any) => {
        console.log(err);
    });
onMounted(async () => {
    currentWallt.value = await indexDbData.getData('currentWalltAddress');
    console.log(currentWallt.value, 'currentWallt.value');
    // 获取钱包余额
    rpcUrlData.value = await indexDbData.getData('rpc_url');
    try {
        // 钱包地址
        let balance: any = await getBalance(
            rpcUrlData.value.url,
            Object.assign({ netWorkType: rpcUrlData.value.netWorkType }, currentWallt.value)
        );
        if (rpcUrlData.value.netWorkType == 'utxo') {
            balanceSecre.value = balance.toLocaleString();
        } else {
            balanceSecre.value = balance;
        }
        console.log(balanceSecre.value, '转账', sendTradePage.value);
    } catch (error) {}
});
// 返回上一页面
const toBack = () => {
    if (sendTradePage.value == 'home') {
        bus.emit('nextPage', '');
    } else {
        sendTradePage.value = 'home';
    }
};
// 获取子组件传递的地址信息
bus.on('sendTradeBook', (data: any) => {
    console.log(data);
    toAddress.value = data.address;
    sendTradePage.value = 'home';
});
// 返回上一级
bus.on('sendTradeBack', () => {
    sendTradePage.value = 'home';
});
// 只能输入数字
const validateNumberInput = () => {
    quantity.value = quantity.value.replace(/[^0-9.]/g, '');
};
// 跳转转账页面
const toTransfer = async () => {
    if (!currentWallt.value['address']) {
        bus.emit('promptModalErr', '请选择付款地址');
        return;
    }
    if (!confirmPsd.value) {
        bus.emit('promptModalErr', '请输入密码');
        return;
    }
    if (md5(confirmPsd.value) != passKey.value) {
        bus.emit('promptModalErr', '您输入的密码有误');
        return;
    }
    if (md5(confirmPsd.value) != passKey.value) {
        bus.emit('promptModalErr', '您输入的密码有误');
        return;
    }
    if (!quantity.value || !Number(quantity.value * 1)) {
        bus.emit('promptModalErr', '请输入正确的转账数量');
        return;
    }
    if (!toAddress.value && !props['type']) {
        bus.emit('promptModalErr', '请选择收款地址');
        return;
    }
    if (currentWallt.value['address'] && currentWallt.value['address'] == toAddress.value) {
        bus.emit('promptModalErr', '付款地址和接收地址不能相同');
        return;
    }
    if (balanceSecre.value * 1 <= quantity.value) {
        bus.emit('promptModalErr', '您的余额不足');
        return;
    }
    loading.value = true;

    // 获取当前的助记词
    let data = await indexDbData.getData('keyStore');
    let key = toRaw(data.secret[currentWallt.value['keyStore']]);
    console.log(data, currentWallt.value, '转账的key');

    // 如果账户是私钥导入的，就直接赋值私钥
    let encryption = await Decrypt(key, passKey.value);
    console.log(encryption, 'encryption');

    if (currentWallt.value['keyStoreType'] && currentWallt.value['keyStoreType'] == 'privateKey') {
        privateKey.value = { privateKey: encryption };
        if (props['type'] && props['type'] == 'transfer') {
            bus.emit('promptModalErr', '该账户不可划转');
            return;
        }
    } else {
        if (rpcUrlData.value['netWorkType'].toLowerCase() == 'evm') {
            privateKey.value = await evmKey(encryption);
        } else {
            privateKey.value = await utxoKey(encryption);
        }
    }
    console.log(privateKey.value, 'privateKey');
    if (rpcUrlData.value['netWorkType'].toLowerCase() == 'evm') {
        // nonce.value = await getNonce(currentWallt.value['address'], rpcUrlData.value['url']);
        console.log(balanceSecre.value, 'balanceSecre');
        let gas = await getGas(rpcUrlData.value['url'], currentWallt.value['address'], toAddress.value, quantity.value);
        transferContent.value = {
            to: toAddress.value, // 接收方地址
            value: quantity.value, // 转账 wei
            // nonce: nonce.value, //nonce
            chainId: rpcUrlData.value['CHAIN_ID'],
            gasLimit: gas.gasLimit,
            gasPrice: gas.gasPrice,
            key: privateKey.value['privateKey'], //私钥
            url: rpcUrlData.value['url'],
            balance: balanceSecre.value
        };
    } else {
        transferContent.value = {
            to: toAddress.value, // 接收方地址
            value: quantity.value, // 转账
            chainId: rpcUrlData.value['CHAIN_ID'],
            key: privateKey.value['privateKey'], //私钥
            url: rpcUrlData.value['url'],
            tactics: utxoTactics.value
        };
    }
    loading.value = false;
    if (props['type'] && props['type'] == 'transfer') {
        transferContent.value['type'] = 'transfer';
        transferContent.value['encryption'] = encryption;
    }
    console.log(transferContent.value, 'transferContent.value');
    sendTradePage.value = 'transfer';
};
</script>

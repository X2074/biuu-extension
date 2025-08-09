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
import transfer from './transfer/index.vue';
import md5 from 'js-md5';
import CustomSelect from '@/components/customSelect/index.vue';
import qitmeer from 'qitmeer-js';
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
let toEvmAddress = ref(null);
let selectedEvmAddress:any = ref(null);//选中的evm地址
indexDbData.getData('EVM').then((res: any) => {
    if (res.content && res.content['8131']) {//目前只支持测试环境，正式环境还未进行测试
        toEvmAddress.value = res.content['8131'].walltInfo;
    }
});
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
// 只能输入数字
const validateNumberInput = () => {
    quantity.value = quantity.value.replace(/[^0-9.]/g, '');
};

const handleAddressChange = async (e:any)=>{
    console.log(selectedEvmAddress.value, e,'encryption');
}
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
    if (!selectedEvmAddress.value && !props['type']) {
        bus.emit('promptModalErr', '请选择收款地址');
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
    let encryption = await Decrypt(key, passKey.value);

    console.log(encryption, 'encryption');

    // 如果账户是私钥导入的，就直接赋值私钥
    if (currentWallt.value['keyStoreType'] && currentWallt.value['keyStoreType'] == 'privateKey') {
        privateKey.value = encryption;
    } else {
        privateKey.value = await utxoKey(encryption);
    }
    console.log(privateKey.value, 'encryption00000');
    let privateKeyEvm:any;
    let keyEvm = toRaw(data.secret[selectedEvmAddress.value['keyStore']]);
    let encryptionEvm = await Decrypt(keyEvm, passKey.value);
    if(selectedEvmAddress.value['keyStoreType']) {
        privateKeyEvm = encryptionEvm;
    }else{
        privateKeyEvm = await evmKey(encryptionEvm);
    }
    
    // 生成 keyPair
    const keyPair = qitmeer.ec.fromPrivateKey(Buffer.from(privateKeyEvm, 'hex'));
    toAddress.value = selectedEvmAddress.value['address'];
    // 生成 pkaddr（EVM公钥地址，Tk开头）
    const pkaddr = qitmeer.address.ecToPkAddress(keyPair.publicKey, 'testnet');
    // 获取toEVM的私钥
    console.log('privateKeyEvm', privateKeyEvm);
    transferContent.value = {
        from: currentWallt.value['utxoAddressTest'], // 发送方地址
        to:selectedEvmAddress.value['address'],//接收方evm地址
        pkaddr: pkaddr, // 接收方地址UTXO地址
        toShow:selectedEvmAddress.value['address'],
        value: quantity.value, // 转账
        chainId: rpcUrlData.value['CHAIN_ID'],
        key: privateKey.value, //私钥
        url: rpcUrlData.value['url'],
        tactics: utxoTactics.value
    };
    loading.value = false;
    if (props['type'] && props['type'] == 'transfer') {
        transferContent.value['type'] = 'transfer';
        transferContent.value['encryption'] = encryption;
    }
    console.log(transferContent.value, 'transferContent.value');
    sendTradePage.value = 'transfer';
};
</script>

<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, defineProps, nextTick } from 'vue';
import bus from '@/utils/bus.js'; 
import indexDbData from '@/utils/indexDB';
import { Decrypt,evmKey } from '@/utils/index.js';
import {createMnemonic,createWallet} from "@/utils/createUser"
import {editContent} from "@/utils/editContent"
import QRCode from 'qrcodejs2-fix';
import Web3 from 'web3'
import md5 from 'js-md5';
let loading = ref(true)
let loadingText = ref('加载中...')
let nowAccount = ref(null)
let passKey = ref('');//密码
let passKeyModel = ref('')//输入框密码
let psdType = ref("hide")
let privateKey = ref('')//私钥
let userName = ref('');//账户昵称
let userNameStatus = ref(false);//昵称展示还是编辑
let qrCodeDiv = ref(null)
let accountOperate = ref('show')
const props = defineProps(['address'])
let rpcData = ref(null)
onMounted(() => {
    initializeInfo()
    
    nextTick(()=>{
        // 第一次创建，后面不再创建
        new QRCode(qrCodeDiv.value, {
            text: props.address,
            width: 200,
            height: 200,
            colorDark: "#333333", //二维码颜色
            colorLight: "#ffffff", //二维码背景色
            correctLevel: QRCode.CorrectLevel.L//容错率，L/M/H
        })
    })
})
// 数据初始化 
const initializeInfo = ()=>{
    // 获取设置的密码
	indexDbData.getData(md5('secret')).then(res => {
		passKey.value = res.secret;
	}).catch(err => { })
    console.log(props,'qrCodeDiv.value');
    // 存为当前展示的钱包数据
    // indexDbData.getData('currentWalltAddress').then(res => {
    //     nowAccount.value = res;
    //     userName.value = nowAccount.value.userName ? nowAccount.value.userName : nowAccount.value.NoIndex;
    // })
    indexDbData.getData('rpc_url').then(res => {
        console.log(res,'res');
        rpcData.value = res;
        if (res && res.walltInfo) {
            let data = res.walltInfo.filter(item=>{
                return item.address == props.address;
            });
        console.log(data,'data');
            nowAccount.value = data[0];
            userName.value = nowAccount.value.userName ? nowAccount.value.userName : nowAccount.value.NoIndex;
            // 指定钱包单位
            accountList.value = res.walltInfo.reverse();
            getBlances(res,data)
        }
    }).catch(err=>{})
    userNameStatus.value = false;
    loading.value = false;
}

const getBlances = async (data,content)=>{
    // 定义rpc
    let web3 = new Web3(new Web3.providers.HttpProvider(data.url));
    let balance = await web3.eth.getBalance(content['address']);
    balance = web3.utils.fromWei(balance, 'ether');
    balance = String(balance).replace(/^(.*\..{4}).*$/, '$1');
    nowAccount.value['balance'] = balance;
    loading.value = false;
}
// 修改昵称
const editName = ()=>{
    if(!userName.value) return;
    loading.value = true;
    editContent('userName',userName.value,nowAccount.value.address).then(res=>{
        initializeInfo()
    }).catch(err=>{
        loading.value = false;
    })
}
// 复制
const onCopy = (txt) => {
	navigator.clipboard.writeText(txt);
	
    bus.emit('promptModalSuccess','复制成功')
}

// 确认密码
const confirmPsd = async ()=>{
    if(!passKeyModel.value){
        bus.emit('promptModalErr','请输入密码')
        return;
    }
    if(md5(passKeyModel.value) != passKey.value){
        bus.emit('promptModalErr','您输入的密码有误')
        return;
    }
    loading.value = true;
    // 获取当前的助记词
    let data = await indexDbData.getData('keyStore')
        console.log(data,'data');
    let key = data.secret[nowAccount.value.keyStore];
    console.log(key,'key');
    // 解密助记词
    let encryption = Decrypt(key, passKey.value)
    // 如果账户是私钥导入的，就直接赋值私钥
    if(nowAccount.value['keyStoreType'] == 'privateKey'){
        loading.value = false;
        privateKey.value = encryption;
        accountOperate.value = "privateKey"
        return;
    }
    console.log(encryption,'encryption');
    
    if(rpcData.value && rpcData.value['netWorkType'] == 'evm'){
        evmKey(encryption).then(keys => {
            console.log(keys, 'keys');
            loading.value = false;
            //此处应该判断是evm还是utxo
            privateKey.value = keys.privateKey;
            accountOperate.value = "privateKey"
        })
    }else{
        utxoKey(encryption).then(keys => {
            console.log(keys, 'keys');
            loading.value = false;
            //此处应该判断是evm还是utxo
            privateKey.value = keys.privateKey;
            accountOperate.value = "privateKey"
        })
    }
}
</script>
<style lang="scss">
@import "./index.scss";
</style>
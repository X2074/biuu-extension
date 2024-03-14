<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, toRaw,defineProps } from 'vue';
import bus from '@/utils/bus.js'; 
import indexDbData from '@/utils/indexDB';
import { Encrypt, Decrypt } from '@/utils/index.js';
import {createMnemonic,createWallet} from "@/utils/createUser"
import showPrivateKey from '../showPrivateKey/index.vue'
import importWallet from '../../../components/importWallet/index.vue'
import deleteWallt from '../deleteWallt/index.vue'
import Web3 from 'web3'
import md5 from 'js-md5';
let accountList = ref([]);
let nowAccount = ref(null)
let accountContent = ref(null)
let passKey = ref('');//密码

let checkAddressText = ref('')
let accountType = ref('')//当前展示钱包那一套流程

let loading = ref(false)
let loadingText = ref('加载中...')

let prop = defineProps(['pageType'])
onMounted(async () => {
    loading.value = true;
    await initializeInfo()
    if(prop && prop.pageType){
        indexDbData.getData('currentWalltAddress').then(res => {
            checkAddressText.value = res.address;
            accountType.value = prop.pageType;
        })
    }else{
        accountType.value = 'list';
    }
})

const initializeInfo = async()=>{
    // 获取设置的密码
	indexDbData.getData(md5('secret')).then(res => {
		passKey.value = res.secret;
	}).catch(err => { })
    // 获取当前展示的钱包数据
    indexDbData.getData('currentWalltAddress').then(res => {
        nowAccount.value = res;
    })
    indexDbData.getData('rpc_url').then(res => {
        console.log(res,'res');
        if (res && res.walltInfo) {
            accountContent.value = res;
            // 指定钱包单位
            accountList.value = res.walltInfo.reverse();
            getBlances(res)
        }
    }).catch(err=>{})
    loading.value = false;
}

const getBlances = async (data)=>{
    // 定义rpc
    let web3 = new Web3(new Web3.providers.HttpProvider(data.url));
    for (let i = 0; i < accountList.value.length; i++) {
        let balance = await web3.eth.getBalance(accountList.value[i]['address']);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = String(balance).replace(/^(.*\..{4}).*$/, '$1');
        accountList.value[i]['balance'] = balance;
    }
}
// 导入账户
const importAccount = ()=>{

}
// 创建账号
const createAccount = async ()=>{
    loading.value = true;
    let mnemonic = await createMnemonic();
    let account = await createWallet(mnemonic);
    console.log(account,'account');
    // 助记词加密
    let ciphertext = Encrypt(mnemonic, passKey.value);
    // 保存加密数据
    indexDbData.getData('keyStore').then(res => {
        let data:any = {};
        console.log(res.secret,'老的key');
        let info:any = {};
        info[account['keystore']] = ciphertext
        console.log(info,'新的key');
        
        data = Object.assign(res.secret,info)
        console.log(data,'合并的key');
        // 保存key
        indexDbData.putData({
            id: 'keyStore',
            secret: data
        })
    })
    
    indexDbData.getData('currentWalltAddress').then(res => {
        let content = {
            id: 'currentWalltAddress',
            address: account['address'],
            userName: 'Wallt' + (!res.NoIndex ? '01' : (res.NoIndex + 1 > 10 ? res.NoIndex + 1 : '0' + (res.NoIndex + 1))),
            userUrl: '',
            keystore:account['keystore'],
            NoIndex: res.NoIndex ? (res.NoIndex + 1) : 1//当前第几个用户
        }
        // 存为当前展示的钱包数据
        indexDbData.getData('currentWalltAddress').then(res => {
            indexDbData.putData(content)
        }).catch(err => {})
        // 存为当前选中的网络中数据
        indexDbData.getData('rpc_url').then(res => {
            res.walltInfo.push(content)
            // 保存key
            indexDbData.putData(res)
        })
        evmNetwork(account);//新增并存储evm网络
        utxoNetwork(account);//新增并存储evm网络
        setTimeout(()=>{
            initializeInfo()
            loading.value = false;
        },500)
    })
    
}


const evmNetwork = (data) => {
    indexDbData.getData('EVM').then(res => {
        Object.keys(res.content).forEach((item, index) => {
            res.content[item].walltInfo.push({
                address: data.address, //当前用户地址
                userName: 'Wallt' + (item.NoIndex + 1 > 10 ? item.NoIndex + 1 : '0' + (item.NoIndex + 1)),
                userUrl: '',
                keystore:data['keystore'],
                NoIndex: index + 1//当前第几个用户
            })
        })
        indexDbData.putData(res)
    })
}
const utxoNetwork = (data) => {
    indexDbData.getData('UTXO').then(res => {
        Object.keys(res.content).forEach((item, index) => {
            res.content[item].walltInfo.push({
                utxoAddressTest: data.utxoAddressTest, //当前用户测试地址
                address: data.utxoAddressMain, //当前用户地址
                userName: 'Wallt' + (item.NoIndex + 1 > 10 ? item.NoIndex + 1 : '0' + (item.NoIndex + 1)),
                userUrl: '',
                keystore:data['keystore'],
                NoIndex: index + 1//当前第几个用户
            })
        })
        indexDbData.putData(res)
    })
}

// 选中的账号
const checkAddress = (data)=>{
    checkAddressText.value = data.address;
    accountType.value = 'model';
    // accountType.value = 'showKey';
}
// 选为主账号
const checkAccount = ()=>{
    if(checkAddressText.value == nowAccount.value.address){
        bus.emit('promptModalWarn','当前已是主账号')
        return;
    }
    let data = toRaw(accountList.value)
    let dbData = data.filter(item=>{
        return item.address == checkAddressText.value;
    })
    if(!dbData || !dbData.length){
        bus.emit('promptModalErr','您选择的账号有误')
        return;
    }
    console.log(dbData,'data[0]');
    let currentWallt = dbData[0];
    currentWallt['id'] = 'currentWalltAddress'
    indexDbData.putData(currentWallt);
    setTimeout(()=>{
        bus.emit('nextPage','homePage')
    },300)
}
// 上一页
const backPage = ()=>{
    if(prop && prop.pageType && accountType.value == 'showKey'){
        bus.emit('homePageBack','')
    }
    if(accountType.value == 'list'){
        bus.emit('homePageBack','')
    }else{
        accountType.value = 'list'
    }
}

bus.on('selectAccountPage',(res)=>{
    console.log(res,'resresresres');
    
    if(res == 'list'){
        loading.value = true;
        accountType.value = 'list'
        initializeInfo()
    }
})  

</script>
<style lang="scss">
@import "./index.scss";
</style>
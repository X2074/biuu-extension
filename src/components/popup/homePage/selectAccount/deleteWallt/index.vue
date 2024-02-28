<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, defineProps, nextTick } from 'vue';
import bus from '@/utils/bus.js'; 
import indexDbData from '@/utils/indexDB';
import {editContent} from "@/utils/editContent"
import Web3 from 'web3'
import md5 from 'js-md5';
let loading = ref(false)
let loadingText = ref('加载中...')
let nowAccount = ref(null)
let passKey = ref('');//密码
let passKeyModel = ref('')//输入框密码
let psdType = ref("hide")
let userName = ref('');//账户昵称
const props = defineProps(['address'])
let rpcData = ref(null)
let currentWallt = ref(null);//当前展示的钱包
onMounted(() => {
    initializeInfo()
})
// 数据初始化 
const initializeInfo = ()=>{
    // 获取设置的密码
	indexDbData.getData(md5('secret')).then(res => {
		passKey.value = res.secret;
	}).catch(err => { })
    
    // 存为当前展示的钱包数据
    indexDbData.getData('currentWalltAddress').then(res => {
        nowAccount.value = res;
        currentWallt.value = res;
        userName.value = nowAccount.value.userName ? nowAccount.value.userName : nowAccount.value.NoIndex;
    })

    // indexDbData.getData('rpc_url').then(res => {
    //     console.log(res,'res');
    //     rpcData.value = res;
    //     if (res && res.walltInfo) {
    //         let data = res.walltInfo.filter(item=>{
    //             return item.address == props.address;
    //         });
    //     console.log(data,'data');
    //         nowAccount.value = data[0];
    //         userName.value = nowAccount.value.userName ? nowAccount.value.userName : nowAccount.value.NoIndex;
    //         // 指定钱包单位
    //         accountList.value = res.walltInfo.reverse();
    //         getBlances(res,data)
    //     }
    // }).catch(err=>{})
    loading.value = false;
}

const getBlances = async (data,content)=>{
    // 定义rpc
    let web3 = new Web3(new Web3.providers.HttpProvider(data.url));
    let balance = await web3.eth.getBalance(content['address']);
    balance = web3.utils.fromWei(balance, 'ether');
    balance = String(balance).replace(/^(.*\..{4}).*$/, '$1');
    nowAccount.value['balance'] = balance;
}
// 删除
const confirmRemove = ()=>{
    console.log("删除");
    
    // 删除加密数据
    indexDbData.getData('keyStore').then(res => {
        let objName = nowAccount.value.address;
        const { [objName]:deletedItem, ...rest } = res.secret;
        // 保存key
        indexDbData.putData({
            id: 'keyStore',
            secret: rest
        })
    })
    let firstWallt:any = {};
    // 删除选中的网络中数据
    indexDbData.getData('rpc_url').then(res => {
        let data = res.walltInfo.filter(item=>{
            return item.address != nowAccount.value.address;
        })
        res.walltInfo = data;
        firstWallt = data[0];
        firstWallt['keyStore'] = firstWallt['address'];
        // 保存key
        indexDbData.putData(res);
        
        // 如果当前的就是选中的钱包
        if(nowAccount.value.address == currentWallt.value.address){
            console.log(firstWallt,'firstWallt');
            firstWallt['id'] = 'currentWalltAddress';
            console.log(firstWallt,'firstWallt002');
            indexDbData.putData(firstWallt)
        }
    bus.emit('selectAccountPage','list')
    })
    evmNetwork();//删除存储evm网络
    utxoNetwork();//删除并存储evm网络
}


const evmNetwork = () => {
    indexDbData.getData('EVM').then(res => {
        let data:any;
        Object.keys(res.content).forEach((item, index) => {
            data = res.content[item].walltInfo.filter(info=>{
                return info.address != nowAccount.value.address;
            })
            res.content[item].walltInfo = data;
        })
        indexDbData.putData(res)
    })
}
const utxoNetwork = () => {
    indexDbData.getData('UTXO').then(res => {
        let data:any;
        Object.keys(res.content).forEach((item, index) => {
            data = res.content[item].walltInfo.filter(info=>{
                return info.address != nowAccount.value.address;
            })
            res.content[item].walltInfo = data;
        })
        indexDbData.putData(res)
    })
}
</script>
<style lang="scss">
@import "./index.scss";
</style>
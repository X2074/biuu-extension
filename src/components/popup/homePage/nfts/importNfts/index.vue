<template src='./index.html'></template>
<style scoped lang='scss'>
@import './index.scss';
</style>
<script lang='ts' setup>
import { ref, onMounted, reactive, watch } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus';
import {getNFTContent,NFTSaveIndexDB} from '@/utils/nft.js';
let loading = ref(false)
let loadingText = ref('加载中...')
let nftContent = ref(null);
let contractAddress = ref('');//合约地址
let tokenId = ref('');//tokenId
let nftNull = ref(false);//nft状态，是否查询到nft
let currentWallt = ref(null);//当前账户
onMounted(async ()=>{
    currentWallt.value = await indexDbData.getData('currentWalltAddress');
})
// nft相关
//0x763482F3FA257C82176D1c6A21e0D5582850D4E3   1
const getNft = async () => {
    var regex = /^[a-zA-Z0-9]*$/; // 只允许输入数字和字母
    if(!contractAddress.value){  
        bus.emit('promptModalErr','请输入正确的合约地址')
        return;
    }
    if (!regex.test(contractAddress.value)) {
        bus.emit('promptModalErr','无效的合约地址，请再试一次。')
        return;
    }
    if(!tokenId.value){  
        bus.emit('promptModalErr','请输入正确的tokenId')
        return;
    }
    if(!regex.test(tokenId.value)){  
        bus.emit('promptModalErr','无效的tokenId，请再试一次。')
        return;
    }
	let data = await getNFTContent(currentWallt.value,contractAddress.value, tokenId.value);
    if(!data){
        nftNull.value = true;
        return;
    }
    console.log(data,'saveData');
    let saveData = await NFTSaveIndexDB(data);
    console.log(saveData,'saveData');
    if(saveData){
        bus.emit('nextPage')
    }else{
        bus.emit('promptModalErr','当前nft数据有误，请再试一次。')
    }
    console.log(data,'data');
	// NFTTransfer('0x995ab346Db2AB84990552DA8cC5Bd474E2888c03', '0x243Def9569745c3ae44029526e9449572201B522', '0x533f6FEcE8aF41da6c41de7aF13D289bA92f9fE9', 70)
}
// 返回上一页面
const toBack = ()=>{
    bus.emit('nextPage','');
}
</script>
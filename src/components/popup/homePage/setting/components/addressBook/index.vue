<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, defineProps,watch, nextTick } from 'vue';
import bus from '@/utils/bus.js'; 
import indexDbData from '@/utils/indexDB';
import addressDetail from "./components/addressDetail/index.vue"
import addressAppend from "./components/addressAppend/index.vue"
let addressBookPage = ref('list');//显示什么内容 
let rawData = ref(null);//原始数据
let addressList = ref(null);//显示数据
let loading = ref(false)
let searchAddress = ref('')
let loadingText = ref('加载中...')
let detail = ref(null);//详情数据
onMounted(() => {
    loading.value = true;
    getAddressList();
})
// 获取列表
const getAddressList = async ()=>{
    let data = await indexDbData.getData('addressBook');
    if(data){
        rawData.value = data.content;
        addressList.value = data.content;
    }
    loading.value = false;
}


// 取消，回到设置页面
const toBack = ()=>{
    bus.emit('settingPage','options')
}

const checkAddress = (data)=>{
    detail.value = data;
    addressBookPage.value = 'addressDetail';
}

bus.on('addressBook',async (res)=>{
    await getAddressList();
    addressBookPage.value = res;
})
watch(searchAddress, (newV) => {
    console.log(newV,'newV');
    
    if(!newV){
        addressList.value = rawData.value;
    }else{
        addressList.value = rawData.value.filter(item=>{
            if(item.name.includes(newV) || item.address.toLowerCase().includes(newV.toLowerCase())){
                return item;
            }
        })
    }

}, { immediate: true })
</script>
<style scoped lang="scss">
@import "./index.scss";
</style>
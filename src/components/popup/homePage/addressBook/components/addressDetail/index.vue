<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, defineProps, nextTick } from 'vue';
import bus from '@/utils/bus.js'; 
import indexDbData from '@/utils/indexDB';
let name = ref(''); 
let address = ref(''); 
let editContent = ref(false)
const props = defineProps(['detail'])
let detail = ref(null)
onMounted(() => {
    name.value = props.detail.name;
    address.value = props.detail.address;
    detail.value = props.detail;
})

const editAddress = async ()=>{
    if(!name.value){
        bus.emit('promptModalErr','请输入联系人名称')
        return;
    }
    if(!address.value){
        bus.emit('promptModalErr','请输入联系人地址')
        return;
    }
    var regex = /^[a-zA-Z0-9]*$/; // 只允许输入数字和字母
    if (!regex.test(address.value)) {
        bus.emit('promptModalErr','您输入的地址格式有误')
        return;
    }
    let data = await indexDbData.getData('addressBook');
    
    data['content'].forEach(item=>{
        if(item.address == props.detail.address){
            item.name = name.value;
            item.address = address.value;
            detail.value = item;
        }
    })
    indexDbData.putData(data);
    bus.emit('promptModalSuccess','修改成功');
    editContent.value = false;
}
const onCopy = () => {
	navigator.clipboard.writeText(props.detail.address);
    bus.emit('promptModalSuccess','复制成功')
}
// 添加地址
const addAddressBook = ()=>{
    bus.emit('addressBook','addressAppend')
}
</script>
<style scoped lang="scss">
@import "./index.scss";
@import "../index.scss";
</style>
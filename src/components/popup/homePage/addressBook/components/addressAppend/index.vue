<template src='./index.html'></template>
<script lang='ts' setup>
import { ref, onMounted, defineProps, nextTick } from 'vue';
import bus from '@/utils/bus.js'; 
import indexDbData from '@/utils/indexDB';
let name = ref(''); 
let address = ref(''); 
onMounted(() => {

})

const addAddress = async ()=>{
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
    if(data){
        data['content'].push({name:name.value,address:address.value})
        indexDbData.putData(data)
    }else{
        let info = {
            id:'addressBook',
            content:[
                {
                    name:name.value,
                    address:address.value
                }
            ]
        }
        indexDbData.putData(info)
    }
    bus.emit('promptModalSuccess','添加成功')
    bus.emit('addressBook','list')
}

</script>
<style scoped lang="scss">
@import "../index.scss";
</style>
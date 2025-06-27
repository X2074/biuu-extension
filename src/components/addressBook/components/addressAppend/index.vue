<template src="./index.html"></template>
<script lang="ts">
export default {
    name: 'addressAppend'
};
</script>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import bus from '@/utils/bus.js';
import indexDbData from '@/utils/indexDB.js';
let name = ref('');
let address = ref('');
onMounted(() => {});

const addAddress = async () => {
    if (!name.value) {
        bus.emit('promptModalErr', '请输入联系人名称');
        return;
    }
    if (!address.value) {
        bus.emit('promptModalErr', '请输入联系人地址');
        return;
    }
    var regex = /^[a-zA-Z0-9]*$/; // 只允许输入数字和字母
    if (
        !regex.test(address.value) ||
        (address.value.slice(0, 2) == '0x' && address.value.length != 42) ||
        (address.value.slice(0, 2) == '0x' && (address.value.length < 26 || address.value.length > 35))
    ) {
        //EVM和UTXO格式校验
        bus.emit('promptModalErr', '您输入的地址格式有误');
        return;
    }
    let data = await indexDbData.getData('addressBook');
    if (data) {
        data['content'].push({ name: name.value, address: address.value });
        indexDbData.putData(data);
    } else {
        let info = {
            id: 'addressBook',
            content: [
                {
                    name: name.value,
                    address: address.value
                }
            ]
        };
        indexDbData.putData(info);
    }
    bus.emit('promptModalSuccess', '添加成功');
    bus.emit('addressBook', 'list');
};
</script>
<style scoped lang="scss">
@import '../index.scss';
</style>

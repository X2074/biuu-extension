<template src="./index.html"></template>
<script lang="ts">
export default {
    name: 'addressBook'
};
</script>
<script lang="ts" setup>
import { ref, onMounted, watch, toRaw } from 'vue';
import bus from '@/utils/bus.js';
import indexDbData from '@/utils/indexDB.js';
import addressDetail from './components/addressDetail/index.vue';
import addressAppend from './components/addressAppend/index.vue';
let addressBookPage = ref('list'); //显示什么内容
let rawData: any = ref(null); //原始数据
let addressList = ref(null); //显示数据
let loading = ref(false);
let searchAddress = ref('');
let loadingText = ref('加载中...');
let detail = ref(null); //详情数据
let prop = defineProps(['importPage']);
let currentWallt = ref(null); //当前用户信息
let rpcUrlData: any = ref(null);
onMounted(async () => {
    console.log(prop, 'prop');

    rpcUrlData.value = await indexDbData.getData('rpc_url');
    currentWallt.value = await indexDbData.getData('currentWalltAddress');
    loading.value = true;
    getAddressList();
});
// 获取列表
const getAddressList = async () => {
    let data = await indexDbData.getData('addressBook');
    if (data) {
        data.content = data.content.filter((item: any) => {
            if (item.status != 'delete') {
                return item;
            }
        });
        rawData.value = data.content;
        addressList.value = data.content;
    }
    loading.value = false;
};

// 取消，回到设置页面
const toBack = () => {
    bus.emit('settingPage', 'options');
};

const checkAddress = (data: any) => {
    if (prop.importPage && prop.importPage == 'sendTrade') {
        if (rpcUrlData.value['netWorkType'].toLowerCase() == 'evm') {
            if (data.address.slice(0, 2) != '0x' || data.address.length != 42) {
                bus.emit('promptModalErr', '请选择EVM地址');
                return;
            }
        } else {
            if (data.address.slice(0, 2) == '0x' || data.address.length < 26 || data.address.length > 35) {
                //变长（通常 26-35 字符）
                bus.emit('promptModalErr', '请选择UTXO地址');
                return;
            }
        }
        bus.emit('sendTradeBook', toRaw(data));
    } else {
        detail.value = data;
        addressBookPage.value = 'addressDetail';
    }
};
const onCopy = (address: any) => {
    navigator.clipboard.writeText(address);
    bus.emit('promptModalSuccess', '复制成功');
};
const deleteAddress = async (address: any) => {
    let addressBook = await indexDbData.getData('addressBook');
    let data = addressBook.content?.map((item: any) => {
        if (item.address == address) {
            item.status = 'delete';
        }
        return item;
    });
    data = data.filter((item: any) => {
        return item.status != 'delete';
    });
    addressList.value = data;
    rawData.value = data;
};
bus.on('addressBook', async (res: any) => {
    await getAddressList();
    addressBookPage.value = res;
});
watch(
    searchAddress,
    (newV) => {
        console.log(newV, 'newV');

        if (!newV) {
            addressList.value = rawData.value;
        } else {
            addressList.value = rawData.value.filter((item: any) => {
                if (item.name.includes(newV) || item.address.toLowerCase().includes(newV.toLowerCase())) {
                    return item;
                }
            });
        }
    },
    { immediate: true }
);
</script>
<style scoped lang="scss">
@import './index.scss';
</style>

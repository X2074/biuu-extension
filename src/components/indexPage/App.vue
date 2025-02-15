<template src='./index/index.html'></template>
<script lang='ts' setup>
import { ref, onMounted } from "vue";
import indexDbData from "@/utils/indexDB.js";

const netWorkList: any = ref([]); //下拉列表的网络数据
onMounted(() => {
    netWorkChange();
});
// 网络切换
const netWorkChange = () => {
    indexDbData.getData("EVM").then((res: any) => {
        let data = Object.values(res.content);
        netWorkList.value = data;
    });
};
// 新增网络
let networkName = ref("");
let RpcUrl = ref("");
let tokenId = ref("");
let symbol = ref("");
let Blockchain = ref("");
// 新增evm网络
const addNetWork = () => {
    indexDbData.getData("EVM").then((res: any) => {
        let data: any = {};
        data[tokenId.value] = {
            CHAIN_ID: tokenId.value,
            netName: networkName.value,
            unit: symbol.value,
            url: RpcUrl.value,
            walltInfo: [],
        };
        res.content = Object.assign(res.content, data);
        indexDbData.putData(res);
    });
};
</script>
<style lang='scss'>
@import "./index/index.scss";
</style>
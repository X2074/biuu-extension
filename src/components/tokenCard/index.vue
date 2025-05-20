<template src="./index.html"></template>
<script lang="ts">
export default {
    name: 'tokenCard'
};
</script>
<style scoped lang="scss">
@import './index.scss';
</style>
<script lang="ts" setup>
import { ref, onMounted, toRaw } from 'vue';
import indexDbData from '@/utils/indexDB.js';
import { getBlance } from '@/utils/index';
import bus from '@/utils/bus.js';
import md5 from 'js-md5';
let loading = ref(false);
let userAddress = ref(null);
let walltContent: any = ref(null);
let currentWallt = ref(null);
let tokenList: any = ref([]);
onMounted(async () => {
    getInfo();
});
// 获取当前账户相关信息
const getInfo = () => {
    // 如果有当前用户信息，说明已经是生成钱包啦
    indexDbData
        .getData('currentWalltAddress')
        .then((res: any) => {
            console.log(res, 'res');
            if (!res) {
                loading.value = false;
                return;
            }
            if (res && res.address) {
                userAddress.value = res.utxoAddressTest || res.address;
                currentWallt.value = res;
                getBlanceInfo();
            } else {
                loading.value = false;
            }
        })
        .catch(() => {
            loading.value = false;
        });
};
const getBlanceInfo = async () => {
    try {
        let data = await indexDbData.getData('rpc_url');
        walltContent.value = JSON.parse(JSON.stringify(data));
        // 钱包地址
        walltContent.value.address = userAddress.value;
        walltContent.value.blance = await getBlance(
            data.url,
            Object.assign({ netWorkType: data.netWorkType }, currentWallt.value)
        );
        delete walltContent.value.walltInfo;
        walltContent.value;
        let assets = data.walltInfo.filter((res:any)=>{
			return res.address == userAddress.value;
		})
		console.log(assets[0].asset,"assets");
		
        tokenList.value.push(toRaw(walltContent.value));
		tokenList.value = [...tokenList.value,...assets[0].asset]
		// tokenList.value.push(assets[0].asset);
		console.log(546846645645,tokenList.value,'tokenList.value');
		
        loading.value = false;
    } catch (error) {
        loading.value = false;
    }
};
const toImport = () => {
    bus.emit('homePageBack', { page: 'watchAsset' });
};
</script>

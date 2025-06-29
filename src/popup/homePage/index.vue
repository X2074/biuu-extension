<template src="./index.html"></template>
<script lang="ts">
export default {
    name: 'homePage'
};
</script>
<script lang="ts" setup>
import { ref, onMounted, defineProps, toRaw, watch } from 'vue';
import bus from '@/utils/bus.js';
import indexDbData from '@/utils/indexDB.js';
import Web3 from 'web3';
import nftCard from '@/components/nftsCard/index.vue';
import tokenCard from '@/components/tokenCard/index.vue';
import { getBalance } from '@/utils/index';
import { useRouter } from 'vue-router';
let router = useRouter();
const transactionHash = ref(0);
const moreShow = ref(false);
const web3 = ref();
let walltContent: any = ref(null);
const netWorkList: any = ref([]); //下拉列表的网络数据
const netWorkType = ref('EVM'); //网络类型
const walltEnvironment = ref({}); //钱包所在的网络
const walltAccount = ref('nfts');
const pageType = ref(''); //当前需要展示的页面
let loading = ref(true);
let nftDetails = ref(null);
let userAddress = ref(null);
let currentWallt = ref(null);
onMounted(() => {
    initialize();
    getInfo();
}); // 获取账户相关信息
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
                getBalanceInfo();
            } else {
                loading.value = false;
            }
        })
        .catch(() => {
            loading.value = false;
        });
};
const getBalanceInfo = async () => {
    try {
        let data = await indexDbData.getData('rpc_url');
        walltContent.value = data;
        // 钱包地址
        walltContent.value.address = userAddress.value;
        console.log(11111, data);

        walltContent.value.balance = await getBalance(
            data.url,
            Object.assign({ netWorkType: data.netWorkType }, currentWallt.value)
        );
        loading.value = false;
    } catch (error) {
        loading.value = false;
    }
};
// 初始化
const initialize = async () => {
    console.log('initialize');

    let data = await indexDbData.getData('rpc_url');
    if (!data) {
        return;
        netWorkChange('EVM');
    } else {
        // 是否有选中的模式
        await netWorkChange(data.netWorkType ? data.netWorkType : 'EVM');
        walltEnvironment.value = data;
        // 定义rpc
        web3.value = new Web3(new Web3.providers.HttpProvider(data.url));
        await getHash();
        loading.value = false;
    }
};
// 交易hash
const getHash = () => {
    if (!walltContent.value || !walltContent.value.txHash) return;
    if (walltContent.value.txHash && walltContent.value.txHash.length > 1) {
        let index = walltContent.value.txHash.length - 1;
        let txHash = walltContent.value.txHash[index];
        toWei(txHash);
    } else {
        if (!walltContent.value.txHash) return;
        let txHash = walltContent.value.txHash[0];
        toWei(txHash);
    }
};
const onCopy = () => {
    navigator.clipboard.writeText(walltContent.value.address);
    bus.emit('promptModalSuccess', '复制成功');
};
const refresh = () => {
    location.reload();
};
// wei转币
const toWei = (data: any) => {
    console.log(web3.value, 'sadsadsadsad');

    if (!data) return;
    web3.value.eth.getTransaction(data.transactionHash).then((res: any) => {
        if (!res) return;
        transactionHash.value = web3.value.utils.fromWei(res.value, 'ether');
    });
};
const toPage = () => {
    moreShow.value = !moreShow.value;
    // pageType.value = 'showKey';
    // walltAccount.value = 'selectAccount';
    router.push('/selectAccount/showKey');
};

// 当前网络数据
const netWorkChange = (type: any) => {
    netWorkType.value = type.toUpperCase();
    indexDbData.getData(netWorkType.value).then((res: any) => {
        let data = Object.values(res.content);
        netWorkList.value = data;
        console.log(netWorkList.value, 'netWorkList.value');
    });
};
bus.on('closeMore', () => {
    moreShow.value = false;
});
// homepage模块里面的返回按钮
bus.on('homePageBack', (res: any) => {
    loading.value = true;
    walltAccount.value = res.page || 'nfts';
    console.log(res, '跳转nft详情');

    if (res && res.data && res.page == 'nftDetail') {
        //nft详情需要的数据
        nftDetails.value = res.data;
    } else {
        initialize();
    }
});
const toNetwork = () => {
    router.push('/networkSwitching');
};
// 页面切换
const toRouterPage = (url: string) => {
    router.push('/' + url);
};
// 监听数据变化，跳转相应页面
watch(walltAccount, (newV) => {
    if (newV != 'token') {
        router.push('/' + newV);
    }
});
</script>
<style lang="scss">
@import './index.scss';
</style>

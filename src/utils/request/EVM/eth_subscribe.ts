
import getEthersProvider from './getEthers';
// 订阅事件
export default async function eth_subscribe(request: any) {
    console.log(request, 'eth_subscribe');
    /*    try {
        const [subscriptionType, ...params] = request.params || [];
        debugger
        let RPC_URL = await indexDbData.getData('rpc_url');
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);

    const provider = await getEthersProvider()
        // 处理不同类型的订阅
        switch (subscriptionType) {
            case 'newHeads':
                const newHeadsSubscriptionId = await provider.send('eth_subscribe', ['newHeads']);
                console.log('New heads subscription ID:', newHeadsSubscriptionId);
                return newHeadsSubscriptionId;
            case 'logs':
                const logsFilter = params[0];
                const logsSubscriptionId = await provider.send('eth_subscribe', ['logs', logsFilter]);
                console.log('Logs subscription ID:', logsSubscriptionId);
                return logsSubscriptionId;
            case 'newPendingTransactions':
                const newPendingTransactionsSubscriptionId = await provider.send('eth_subscribe', ['newPendingTransactions']);
                console.log('New pending transactions subscription ID:', newPendingTransactionsSubscriptionId);
                return newPendingTransactionsSubscriptionId;
            case 'syncing':
                const syncingSubscriptionId = await provider.send('eth_subscribe', ['syncing']);
                console.log('Syncing subscription ID:', syncingSubscriptionId);
                return syncingSubscriptionId;
            default:
                throw new Error(`Unsupported subscription type: ${subscriptionType}`);
        }
    } catch (error) {
        console.error('Error in eth_subscribe:', error);
        throw error;
    } */
}
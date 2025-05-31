import indexDbData from '../../indexDB.js';
import getEthersProvider from './getEthers';
export default async function eth_newBlockFilter(request: any) {
    debugger;
    console.log(request, 'requesteth_newBlockFilter');
    // 连接 Ethereum 节点
    // let RPC_URL = await indexDbData.getData('rpc_url');
    // const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);
    const provider = await getEthersProvider()
    let filterId = await provider.send('eth_newBlockFilter', []);
    console.log("Filter ID:", filterId);
    let lastBlock = null;
    const checkBlocks = async () => {
        try {
            const newBlocks = await provider.send('eth_getFilterChanges', [filterId]);
            if (newBlocks.length > 0) {
                lastBlock = newBlocks[newBlocks.length - 1];
                console.log('最新区块哈希:', lastBlock);
            }
        } catch (error) {
            console.error('轮询失败:', error);
            // 重新创建过滤器（如果超时）
            filterId = await provider.send('eth_newBlockFilter', []);
        }
    };
    const poll = async () => {
        await checkBlocks();
        setTimeout(poll, 5000);
    };
    
    poll(); // 开始轮询
}

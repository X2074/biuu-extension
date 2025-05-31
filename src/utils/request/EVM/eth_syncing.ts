import indexDbData from '../../indexDB.js';
import getWeb3Instance from './getWeb3';
//检查节点是否正在同步区块链数据
export default async function eth_syncing(request: any) {
    debugger;
    // const rpc_url = await indexDbData.getData('rpc_url');
    // if (!rpc_url?.url) {
    //     throw new Error('No network selected');
    // }
    // // 创建 Web3 实例
    // const web3 = new Web3(new Web3.providers.HttpProvider(rpc_url.url));
    const web3 = await getWeb3Instance()
    const isSyncing: any = await web3.eth.isSyncing();

    if (isSyncing === false) {
        console.log('节点已完全同步');
    } else {
        console.log('同步进度:', {
            starting: parseInt(isSyncing.startingBlock, 16),
            current: parseInt(isSyncing.currentBlock, 16),
            highest: parseInt(isSyncing.highestBlock, 16),
            progress: (
                ((parseInt(isSyncing.currentBlock, 16) - parseInt(isSyncing.startingBlock, 16)) /
                    (parseInt(isSyncing.highestBlock, 16) - parseInt(isSyncing.startingBlock, 16))) *
                100
            ).toFixed(2)
        });
    }
    return isSyncing;
}
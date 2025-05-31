import indexDbData from '../../indexDB.js';
import getWeb3Instance from './getWeb3';
// 获取区块高度
export default async function blockNumber(): Promise<string> {
    try {
        // 创建 Web3 实例
        const web3 = await getWeb3Instance();
        // 获取区块高度
        const blockNumber = await web3.eth.getBlockNumber();
        console.log('Current block number:', blockNumber);
        // 返回十六进制格式
        return `0x${blockNumber.toString(16)}`;
    } catch (error) {
        console.error('Error in eth_blockNumber:', error);
        throw error;
    }
}
import indexDbData from '../../indexDB.js';
import Web3 from 'web3';
/**
 * 获取 Web3 实例
 * @returns 返回 Web3 实例
 */
export default async function getWeb3Instance(): Promise<Web3> {
    try {
        const rpc_url = await indexDbData.getData('rpc_url');
        if (!rpc_url?.url) {
            throw new Error('未选择网络');
        }
        return new Web3(new Web3.providers.HttpProvider(rpc_url.url));
    } catch (error) {
        console.error('创建 Web3 实例失败:', error);
        throw error;
    }
}
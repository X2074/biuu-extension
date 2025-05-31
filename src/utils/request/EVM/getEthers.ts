 import { ethers } from 'ethers';
 import indexDbData from '../../indexDB.js';
 /**
 * 获取 ethers.js 提供者
 * @returns 返回 ethers.js 提供者实例
 */
export default async function getEthersProvider(): Promise<any> {
    try {
        const rpc_url = await indexDbData.getData('rpc_url');
        if (!rpc_url?.url) {
            throw new Error('未选择网络');
        }
        return new ethers.providers.JsonRpcProvider(rpc_url.url);
    } catch (error) {
        console.error('创建提供者失败:', error);
        throw error;
    }
}
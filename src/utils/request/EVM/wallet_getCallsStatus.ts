import indexDbData from '../../indexDB.js';
import getEthersProvider from './getEthers';

import getWeb3Instance from './getWeb3';
// 获取批处理状态
export default async function wallet_getCallsStatus(request: any) {
    debugger;
    try {
        // 从请求参数中获取交易哈希列表
        const txHashes = request.params || [];
        if (!Array.isArray(txHashes)) {
            throw new Error('参数必须是一个交易哈希数组');
        }

        // let RPC_URL = await indexDbData.getData('rpc_url');
        // const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);
        const provider = await getEthersProvider()

        const statuses = [];

        // 遍历交易哈希列表，查询每个交易的状态
        for (const txHash of txHashes) {
            try {
                const transaction = await provider.getTransaction(txHash);
                if (!transaction) {
                    statuses.push({ hash: txHash, status: 'not_found', message: '未找到该交易' });
                    continue;
                }

                const receipt = await provider.getTransactionReceipt(txHash);
                if (!receipt) {
                    statuses.push({ hash: txHash, status: 'pending', message: '交易仍在处理中' });
                } else {
                    const status = receipt.status === 1 ? 'success' : 'failed';
                    statuses.push({ hash: txHash, status, message: `交易状态: ${status}` });
                }
            } catch (error: any) {
                statuses.push({ hash: txHash, status: 'error', message: `查询交易状态时出错: ${error.message}` });
            }
        }
        console.log(statuses, 'requestwallet_getCallsStatus');
        return statuses;
    } catch (error) {
        console.error('Error in wallet_getCallsStatus:', error);
        throw error;
    }
}
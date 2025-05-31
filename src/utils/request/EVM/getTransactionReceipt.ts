import indexDbData from '../../indexDB.js';
import getWeb3Instance from './getWeb3';

/**
 * 获取交易收据
 * @param request 包含交易哈希的请求对象
 * @returns 返回交易收据对象，如果交易不存在则返回 null
 */
export default async function eth_getTransactionReceipt(request: any): Promise<any> {
    try {
        const { params } = request;
        console.log(params,'params');
        
        const [txHash] = params || [];

        console.log(txHash,'txHash');
        // 验证交易哈希
        if (!txHash || typeof txHash !== 'string' || !txHash.startsWith('0x')) {
            throw new Error('Invalid transaction hash');
        }

        // // 获取当前网络配置
        // const rpc_url = await indexDbData.getData('rpc_url');
        // if (!rpc_url?.url) {
        //     throw new Error('No network selected');
        // }

        // // 创建 Web3 实例
        // const web3 = new Web3(new Web3.providers.HttpProvider(rpc_url.url));
        
        const web3 = await getWeb3Instance()
        
console.log(web3,"web3");
        // 获取交易收据
        const receipt = await web3.eth.getTransactionReceipt(txHash);
        console.log(receipt,"新增的方阿飞");
        
        if (!receipt) {
            // 如果收据不存在，返回 null 而不是抛出错误，这是标准 JSON-RPC 行为
            return null;
        }
        return receipt;
        // // 将 BigNumber 转换为字符串，以便 JSON 序列化
        // const formattedReceipt = {
        //     ...receipt,
        //     blockNumber: receipt.blockNumber ? web3.utils.toHex(receipt.blockNumber) : null,
        //     transactionIndex: receipt.transactionIndex ? web3.utils.toHex(receipt.transactionIndex) : null,
        //     gasUsed: receipt.gasUsed ? web3.utils.toHex(receipt.gasUsed) : null,
        //     cumulativeGasUsed: receipt.cumulativeGasUsed ? web3.utils.toHex(receipt.cumulativeGasUsed) : null,
        //     effectiveGasPrice: receipt.effectiveGasPrice ? web3.utils.toHex(receipt.effectiveGasPrice) : null,
        //     logs: receipt.logs ? receipt.logs.map(log => ({
        //         ...log,
        //         logIndex: log.logIndex ? web3.utils.toHex(log.logIndex) : null,
        //         transactionIndex: log.transactionIndex ? web3.utils.toHex(log.transactionIndex) : null,
        //         blockNumber: log.blockNumber ? web3.utils.toHex(log.blockNumber) : null
        //     })) : []
        // };
    } catch (error) {
        console.error('Error in eth_getTransactionReceipt:', error);
        throw new Error(`Failed to get transaction receipt: ${error.message}`);
    }
}
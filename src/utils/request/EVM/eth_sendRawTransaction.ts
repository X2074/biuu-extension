import indexDbData from '../../indexDB.js';
import Web3 from 'web3';
export default async function eth_sendRawTransaction(request: any) {
    const rawTransaction = request.params[0];

    try {
        // 1. 获取当前连接的节点信息
        const rpcData = await indexDbData.getData('rpc_url');
        if (!rpcData) {
            throw new Error('No RPC URL configured');
        }
        // 2. 使用 web3 发送已签名的交易
        let web3 = new Web3(new Web3.providers.HttpProvider(rpcData.url));

        // 3. 发送交易
        const transactionHash = await web3.eth.sendSignedTransaction(rawTransaction);

        // 4. 返回交易哈希
        return {
            transactionHash: transactionHash
        };
    } catch (error) {
        console.error('Error sending raw transaction:', error);
        throw error;
    }

}

import indexDbData from '../../indexDB.js';
import getEthersProvider from './getEthers';
// 返回给定地址的账户余额
export default async function eth_getBalance(request: any): Promise<string> {
    try {
        const [address, blockTag = 'latest'] = request.params || [];
        if (!address) {
            throw new Error('Missing address parameter');
        }
        let RPC_URL = await indexDbData.getData('rpc_url');
        // 使用 JSON-RPC 提供者
        // const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url); // 替换为你的 RPC URL
        // const provider = new JsonRpcProvider(RPC_URL.url);  高版本的使用方式
        
        const provider = await getEthersProvider(); // 替换为你的 RPC URL
        // 获取余额（返回的是 BigNumber）
        const balance = await provider.getBalance(address, blockTag);
        debugger;
        // 返回十六进制格式的余额（以 wei 为单位）
        return ethers.utils.hexlify(balance);
    } catch (error) {
        console.error('Error in eth_getBalance:', error);
        throw error;
    }
}
import getEthersProvider from './getEthers';
import { ethers } from 'ethers';
import Web3 from 'web3';
import indexDbData from '../../indexDB.js';
export async function eth_getBlockByHash(request: any) {
    // debugger
    console.log(request, 'requesteth_getBlockByHash');
}
export async function eth_coinbase(request: any) {
    debugger;
    console.log(request, 'requesteth_coinbase');
    // let RPC_URL = await indexDbData.getData('rpc_url');
    // const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);
    const provider = await getEthersProvider();
    const coinbase = await provider.send('eth_coinbase', []);
    console.log('Coinbase 地址:', coinbase); // 例如 "0x123..."
    return coinbase;
}
export async function eth_getFilterChanges(request: any) {
    debugger;
    console.log(request, 'requesteth_getFilterChanges');
}

export async function eth_uninstallFilter(request: any) {
    // 连接 Ethereum 节点
    let RPC_URL = await indexDbData.getData('rpc_url');
    // const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);
    
    const provider = await getEthersProvider();
    let filterId = await provider.send('eth_newBlockFilter', []);
    console.log('Filter ID:', filterId);
    // 创建 Web3 实例
    const web3: any = new Web3(new Web3.providers.HttpProvider(RPC_URL.url));
    // 3. 卸载过滤器
    const isUninstalled = await web3.eth.filter.uninstall(filterId);
    console.log(`过滤器${filterId}卸载${isUninstalled ? '成功' : '失败'}`);
    return isUninstalled;
}
// 用于查询指定地址的合约字节码
export async function eth_getCode(request: any) {
    debugger;
    let address = request.params[0] || '';
    // let RPC_URL = await indexDbData.getData('rpc_url');
    // const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);
    
    const provider = await getEthersProvider();
    const bytecode = await provider.getCode(address);
    console.log(`Bytecode: ${bytecode}`);
    return bytecode;
}
export async function eth_getStorageAt(request: any) {
    // let RPC_URL = await indexDbData.getData('rpc_url');
    // const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);
    
    const provider = await getEthersProvider();
    const value = await provider.getStorageAt(
        request.params[0],
        request.params[1] // 存储位置
    );
    console.log(request, value, 'requesteth_getStorageAt');
    return value;
}
//返回从某个地址发送的交易数量。
export async function eth_getTransactionCount(request: any) {
    debugger;
    // let RPC_URL = await indexDbData.getData('rpc_url');
    // const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);
    
    const provider = await getEthersProvider();
    /* // 获取最新nonce
const nonce = await provider.getTransactionCount(request.params[0]); */
    // 获取某状态的nonce(包含内存池中的交易)
    const nonce = await provider.getTransactionCount(request.params[0], request.params[1]);
    // 将 nonce 转换为十六进制格式
    const nonceHex = `0x${nonce.toString(16)}`;
    console.log(nonceHex, 'requesteth_getTransactionCount (Hex)');
    return nonceHex;
}
// 撤销当前dapp的授权
export async function wallet_revokePermissions(request: any) {
    debugger;
    console.log(request, 'requestwallet_revokePermissions');
}
//返回与给定块哈希匹配的块中的交易数。
export async function eth_getBlockTransactionCountByHash(request: any) {
    // let RPC_URL = await indexDbData.getData('rpc_url');
    // const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);
    
    const provider = await getEthersProvider();
    const blockHash = request.params[0]; // 区块哈希
    const txCount = await provider.send('eth_getBlockTransactionCountByHash', [blockHash]);
    return txCount; // 返回十六进制格式的交易数量
    // console.log("Transaction count:", parseInt(txCount, 16)); // 转为十进制
}
//返回与给定区块号匹配的块中的交易数。
export async function eth_getBlockTransactionCountByNumber(request: any) {
    // let RPC_URL = await indexDbData.getData('rpc_url');
    // const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);
    
    const provider = await getEthersProvider();
    let blockNumber = request.params[0];
    const txCount = await provider.send('eth_getBlockTransactionCountByNumber', [blockNumber]);
    return txCount;
    // console.log("Transaction count:", parseInt(txCount, 16));
}
//根据区块哈希和交易索引（位置）查询交易详情,返回指定区块中特定位置的完整交易数据。
export async function eth_getTransactionByBlockHashAndIndex(request: any) {
    debugger;
    console.log(request, 'requesteth_getTransactionByBlockHashAndIndex');
    const [blockHash, index] = request.params;
    // let RPC_URL = await indexDbData.getData('rpc_url');
    // const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);
    
    const provider = await getEthersProvider();
    const tx = await provider.send('eth_getTransactionByBlockHashAndIndex', [blockHash, index]);
    console.log('Transaction:', tx);
    return tx;
}
import indexDbData from '../../indexDB.js';
import { showExtensionPopup } from '../../index.ts';
import { ethers } from 'ethers';
import addEthereumChain from './addEthereumChain';
import requestPermissions from './requestPermissions';
import ethCall from './ethCall';
import eth_sendTransaction from './sendTransaction';
import { watchAsset } from './watchAsset';
import Web3 from 'web3';

// 添加处理签名请求的函数
async function handleSignMessage(request: any) {
    try {
        const [message, address] = request.params || [];

        // 获取当前活动标签页
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.url) {
            throw new Error('Unable to determine the current tab URL');
        }

        const currentOrigin = new URL(tab.url).origin;
        // 创建签名弹窗
        let url: any = `/sign?message=${encodeURIComponent(message)}&address=${address}&origin=${encodeURIComponent(
            currentOrigin
        )}`;
        let popupUrl: any = await showExtensionPopup(url);
        // 返回一个 Promise，等待用户响应
        return new Promise((resolve, reject) => {
            const handleMessage: any = (message: any) => {
                console.log(message, 'messagehandleMessage');

                if (message.action === 'signature_response') {
                    chrome.runtime.onMessage.removeListener(handleMessage);

                    if (message.signature) {
                        resolve(message.signature);
                    } else {
                        reject(new Error(message.error || 'User rejected the request'));
                    }
                }
            };

            chrome.runtime.onMessage.addListener(handleMessage);

            // 设置超时
            setTimeout(() => {
                chrome.runtime.onMessage.removeListener(handleMessage);
                reject(new Error('Sign request timeout'));
            }, 300000); // 5分钟超时
        });
    } catch (error) {}
}

//   获取权限数据
function requestGetPermissions() {
    return indexDbData.getData('authorized_sites');
}

// 添加处理签名请求的函数
async function getChainId() {
    try {
        let rpcData: any = await indexDbData.getData('rpc_url');
        return new Promise((resolve, reject) => {
            if (rpcData) {
                  // 将 CHAIN_ID 转换为十六进制
                  const hexChainId = `0x${Number(rpcData.CHAIN_ID).toString(16)}`;
                resolve(hexChainId);
            } else {
                reject(new Error('RPC URL not found'));
            }
        });
    } catch {}
}
// 获取授权签名的用户地址
async function requestAccounts() {}

// 获取钱包版本
async function getWalltVersion() {
    return new Promise((resolve) => {
        resolve('1.0.0');
    });
}

// 钱包切换到指定的以太坊链
async function switchEthereumChain(request: any) {
    const [chainId] = request.params || [];
    let numChainId = Number(chainId['chainId']);
    console.log(numChainId, 'chainId'); // 输出: "0x1fc3"
    // 获取当前所有的链
    let chainsEVM = await indexDbData.getData('EVM');
    let chainsUTXO = await indexDbData.getData('UTXO');
    let chainsEVMData = chainsEVM['content'][numChainId];
    let chainsUTXOData = chainsUTXO['content'][numChainId];
    return new Promise((resolve, reject) => {
        if (chainsEVMData || chainsUTXOData) {
            // 当前要切换的网络
            let checkChain = chainsEVMData || chainsUTXOData;
            checkChain['netWorkType'] = chainsEVMData ? 'EVM' : 'UTXO';
            // 存储选中的网络数据
            indexDbData.putData(
                Object.assign(
                    {
                        id: 'rpc_url'
                    },
                    checkChain
                )
            );
            // 当前用户信息
            let currentWalltAddress = checkChain['walltInfo'][0];
            currentWalltAddress['id'] = 'currentWalltAddress';
            currentWalltAddress['netWorkType'] = checkChain['netWorkType'];
            indexDbData.putData(currentWalltAddress);
            resolve(true);
        } else {
            let err = {
                code: 4902,
                message: `Unrecognized chain ID \"${chainId['chainId']}\". Try adding the chain using wallet_addEthereumChain first.`
            };
            reject(err);
        }
    });
}

// 撤销当前dapp的授权
async function revokePermissions() {}

// 获取区块高度
async function blockNumber(): Promise<string> {
    try {
        // 获取当前网络配置
        const rpc_url = await indexDbData.getData('rpc_url');
        if (!rpc_url?.url) {
            throw new Error('No network selected');
        }

        // 创建 Web3 实例
        const web3 = new Web3(new Web3.providers.HttpProvider(rpc_url.url));

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
// 返回给定地址的账户余额
async function eth_getBalance(request: any): Promise<string> {
    try {
        const [address, blockTag = 'latest'] = request.params || [];
        if (!address) {
            throw new Error('Missing address parameter');
        }
        let RPC_URL = await indexDbData.getData('rpc_url');
        // 使用 JSON-RPC 提供者
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url); // 替换为你的 RPC URL
        // const provider = new JsonRpcProvider(RPC_URL.url);  高版本的使用方式
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
async function eth_gasPrice(request: any) {
    console.log(request, 'requesteth_gasPrice');
    debugger;
    let RPC_URL = await indexDbData.getData('rpc_url');
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);

    const gasPriceWei = await provider.getGasPrice(); // 返回 BigNumber 对象（wei）
    const gasPriceHex = gasPriceWei.toHexString(); // 转为 0x 开头的 16 进制字符串
    console.log('Gas Price (Hex):', gasPriceHex); // 例如 "0x12a05f200"
    /* const gasPriceGwei = ethers.utils.formatUnits(gasPriceWei, "gwei"); // 转为 Gwei
  console.log(`当前 Gas 价格: ${gasPriceGwei} Gwei ,${gasPriceWei}`) */ return gasPriceHex;
}
async function eth_getBlockByHash(request: any) {
    // debugger
    console.log(request, 'requesteth_getBlockByHash');
}
async function eth_coinbase(request: any) {
    debugger;
    console.log(request, 'requesteth_coinbase');
    let RPC_URL = await indexDbData.getData('rpc_url');
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);
    const coinbase = await provider.send('eth_coinbase', []);
    console.log('Coinbase 地址:', coinbase); // 例如 "0x123..."
    return coinbase;
}
async function eth_newBlockFilter(request: any) {
    debugger;
    console.log(request, 'requesteth_newBlockFilter');
    // 连接 Ethereum 节点
    let RPC_URL = await indexDbData.getData('rpc_url');
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);
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
async function eth_getFilterChanges(request: any) {
    debugger;
    console.log(request,'requesteth_getFilterChanges');
}
//检查节点是否正在同步区块链数据
async function eth_syncing(request: any) {
    debugger;
    const rpc_url = await indexDbData.getData('rpc_url');
    if (!rpc_url?.url) {
        throw new Error('No network selected');
    }
    // 创建 Web3 实例
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc_url.url));
    const isSyncing:any = await web3.eth.isSyncing();
  
    if (isSyncing === false) {
        console.log('节点已完全同步');
      } else {
        console.log('同步进度:', {
          starting: parseInt(isSyncing.startingBlock, 16),
          current: parseInt(isSyncing.currentBlock, 16),
          highest: parseInt(isSyncing.highestBlock, 16),
          progress: ((parseInt(isSyncing.currentBlock, 16) - parseInt(isSyncing.startingBlock, 16)) / 
                    (parseInt(isSyncing.highestBlock, 16) - parseInt(isSyncing.startingBlock, 16)) * 100).toFixed(2)
        });
    }
    return isSyncing
}
async function eth_uninstallFilter(request: any) {
      // 连接 Ethereum 节点
      let RPC_URL = await indexDbData.getData('rpc_url');
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);
      let filterId = await provider.send('eth_newBlockFilter', []);
    console.log("Filter ID:", filterId);
    // 创建 Web3 实例
    const web3:any= new Web3(new Web3.providers.HttpProvider(RPC_URL.url));
      // 3. 卸载过滤器
  const isUninstalled = await web3.eth.filter.uninstall(filterId);
    console.log(`过滤器${filterId}卸载${isUninstalled ? '成功' : '失败'}`);
    return isUninstalled
}
// 用于查询指定地址的合约字节码
async function eth_getCode(request: any) {
    debugger      
    let address = request.params[0] || '';
    let RPC_URL = await indexDbData.getData('rpc_url');
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);
    const bytecode = await provider.getCode(address);
    console.log(`Bytecode: ${bytecode}`);
    return bytecode;
}   
async function eth_getStorageAt(request: any) {
    
    let RPC_URL = await indexDbData.getData('rpc_url');
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);
    const value = await provider.getStorageAt(
        request.params[0], 
        request.params[1]  // 存储位置
    );
    console.log(request, value,'requesteth_getStorageAt');
    return value;
}
//返回从某个地址发送的交易数量。
async function eth_getTransactionCount(request: any) {
    debugger;
    let RPC_URL = await indexDbData.getData('rpc_url');
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);
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
async function wallet_revokePermissions(request: any) {
    debugger;
    console.log(request,'requestwallet_revokePermissions');
}
// 获取批处理状态
async function wallet_getCallsStatus(request: any) {
    debugger;
    try {
        // 从请求参数中获取交易哈希列表
        const txHashes = request.params || [];
        if (!Array.isArray(txHashes)) {
            throw new Error('参数必须是一个交易哈希数组');
        }

        let RPC_URL = await indexDbData.getData('rpc_url');
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);

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
            } catch (error:any) {
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
// 订阅事件
async function eth_subscribe(request: any) {
    console.log(request, 'eth_subscribe');
 /*    try {
        const [subscriptionType, ...params] = request.params || [];
        debugger
        let RPC_URL = await indexDbData.getData('rpc_url');
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);

        // 处理不同类型的订阅
        switch (subscriptionType) {
            case 'newHeads':
                const newHeadsSubscriptionId = await provider.send('eth_subscribe', ['newHeads']);
                console.log('New heads subscription ID:', newHeadsSubscriptionId);
                return newHeadsSubscriptionId;
            case 'logs':
                const logsFilter = params[0];
                const logsSubscriptionId = await provider.send('eth_subscribe', ['logs', logsFilter]);
                console.log('Logs subscription ID:', logsSubscriptionId);
                return logsSubscriptionId;
            case 'newPendingTransactions':
                const newPendingTransactionsSubscriptionId = await provider.send('eth_subscribe', ['newPendingTransactions']);
                console.log('New pending transactions subscription ID:', newPendingTransactionsSubscriptionId);
                return newPendingTransactionsSubscriptionId;
            case 'syncing':
                const syncingSubscriptionId = await provider.send('eth_subscribe', ['syncing']);
                console.log('Syncing subscription ID:', syncingSubscriptionId);
                return syncingSubscriptionId;
            default:
                throw new Error(`Unsupported subscription type: ${subscriptionType}`);
        }
    } catch (error) {
        console.error('Error in eth_subscribe:', error);
        throw error;
    } */
}
//返回与给定块哈希匹配的块中的交易数。
async function eth_getBlockTransactionCountByHash(request: any) {
    let RPC_URL = await indexDbData.getData('rpc_url');
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);
    const blockHash = request.params[0]; // 区块哈希
    const txCount = await provider.send("eth_getBlockTransactionCountByHash", [blockHash]);
    return txCount; // 返回十六进制格式的交易数量
    // console.log("Transaction count:", parseInt(txCount, 16)); // 转为十进制
}
//返回与给定区块号匹配的块中的交易数。
async function eth_getBlockTransactionCountByNumber(request:any) {
    let RPC_URL = await indexDbData.getData('rpc_url');
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);
    let blockNumber=request.params[0];
    const txCount = await provider.send(
        "eth_getBlockTransactionCountByNumber",
        [blockNumber]
    );
    return txCount;
    console.log("Transaction count:", parseInt(txCount, 16));
    
}
export default {
    requestPermissions,
    handleSignMessage,
    requestGetPermissions,
    getChainId,
    requestAccounts,
    getWalltVersion,
    eth_getBalance,
    addEthereumChain,
    switchEthereumChain,
    watchAsset,
	blockNumber,
	ethCall,
    eth_gasPrice,
    eth_coinbase,
    eth_getBlockByHash,
    eth_newBlockFilter,
    eth_sendTransaction,
    eth_getFilterChanges,
    eth_syncing,
    eth_uninstallFilter,  //这个提示 web3.eth.filter.uninstall 不存在，还有报错
    eth_getCode,
    eth_getStorageAt,
    eth_getTransactionCount,
    wallet_revokePermissions,
    wallet_getCallsStatus,
    eth_subscribe,
    eth_getBlockTransactionCountByHash,
    eth_getBlockTransactionCountByNumber
};

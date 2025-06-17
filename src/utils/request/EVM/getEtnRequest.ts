import getEthersProvider from './getEthers';
import { ethers } from 'ethers';
import Web3 from 'web3';
import indexDbData from '../../indexDB.js';
export async function eth_getBlockByHash(request: any) {
    debugger
    try {
        const provider = await getEthersProvider();
        const blockHash = request.params[0]; // 获取请求参数中的区块哈希
        if (!blockHash) {
            throw new Error('缺少区块哈希参数');
        }
        const block = await provider.getBlock(blockHash);
        console.log('获取到的区块信息:', block);
        return block;
    } catch (error) {
        console.error('获取区块信息时出错:', error);
        throw error;
    }
}
/**
 * 根据区块编号获取区块信息
 * @param request 请求对象，params[0] 为区块编号，params[1] 为是否获取交易详情的布尔值
 */
export async function eth_getBlockByNumber(request: any) {
    debugger
    try {
        // 获取以太坊提供者实例
        const provider = await getEthersProvider();

        // 解析请求参数
        const [blockNumberParam, includeTransactions = false] = request.params || [];

        // 处理区块编号参数，支持 'earliest'、'latest'、'pending' 等关键词，也支持数字
        let blockNumber;
        if (typeof blockNumberParam === 'string') {
            if (['earliest', 'latest', 'pending'].includes(blockNumberParam)) {
                blockNumber = blockNumberParam;
            } else {
                // 尝试将十六进制字符串转换为数字
                blockNumber = parseInt(blockNumberParam, 16);
            }
        } else if (typeof blockNumberParam === 'number') {
            blockNumber = blockNumberParam;
        } else {
            throw new Error('无效的区块编号参数');
        }



        // 如果不需要交易详情，重新获取不包含交易的区块信息
        if (!includeTransactions) {
            let block = await provider.getBlock(blockNumber);
            console.log(block, 'block');
            return block
        } else {  // 获取区块信息，可选择是否包含交易详情
            let block = await provider.getBlockWithTransactions(blockNumber);

            return block;
        }


    } catch (error) {
        console.error('获取区块信息时出错:', error);
        throw error;
    }

}
export async function eth_coinbase(request: any) {
    console.log(request, 'requesteth_coinbase');
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
    console.log(request, 'requesteth_coinbase');
    // 连接 Ethereum 节点
    let RPC_URL = await indexDbData.getData('rpc_url');
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
    const provider = await getEthersProvider();
    const bytecode = await provider.getCode(address);
    console.log(`Bytecode: ${bytecode}`);
    return bytecode;
}
export async function eth_getStorageAt(request: any) {
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
    const provider = await getEthersProvider();
    const blockHash = request.params[0]; // 区块哈希
    const txCount = await provider.send('eth_getBlockTransactionCountByHash', [blockHash]);
    return txCount; // 返回十六进制格式的交易数量
    // console.log("Transaction count:", parseInt(txCount, 16)); // 转为十进制
}
//返回与给定区块号匹配的块中的交易数。
export async function eth_getBlockTransactionCountByNumber(request: any) {
    const provider = await getEthersProvider();
    let blockNumber = request.params[0];
    const txCount = await provider.send('eth_getBlockTransactionCountByNumber', [blockNumber]);
    return txCount;
    // console.log("Transaction count:", parseInt(txCount, 16));
}
//根据区块哈希和交易索引（位置）查询交易详情,返回指定区块中特定位置的完整交易数据。
export async function eth_getTransactionByBlockHashAndIndex(request: any) {
    const [blockHash, index] = request.params;
    const provider = await getEthersProvider();
    const tx = await provider.send('eth_getTransactionByBlockHashAndIndex', [blockHash, index]);
    console.log('Transaction:', tx);
    return tx;
}
//根据区块编号和交易索引获取指定交易的详细信息
export async function eth_getTransactionByBlockNumberAndIndex(request: any) {
    debugger
    try {
        // 获取以太坊提供者实例
        const provider = await getEthersProvider();

        // 解析请求参数
        const [blockNumberParam, transactionIndexParam] = request.params || [];

        /*      if (blockNumberParam === undefined || transactionIndexParam === undefined) {
                 throw new Error('缺少区块编号或交易索引参数');
             }
     
             // 处理区块编号参数，支持 'earliest'、'latest'、'pending' 等关键词，也支持数字
             let blockNumber;
             if (typeof blockNumberParam === 'string') {
                 if (['earliest', 'latest', 'pending'].includes(blockNumberParam)) {
                     blockNumber = blockNumberParam;
                 } else {
                     // 尝试将十六进制字符串转换为数字
                     blockNumber = parseInt(blockNumberParam, 16);
                 }
             } else if (typeof blockNumberParam === 'number') {
                 blockNumber = blockNumberParam;
             } else {
                 throw new Error('无效的区块编号参数');
             }
     
             // 处理交易索引参数
             let transactionIndex;
             if (typeof transactionIndexParam === 'string') {
                 transactionIndex = parseInt(transactionIndexParam, 16);
             } else if (typeof transactionIndexParam === 'number') {
                 transactionIndex = transactionIndexParam;
             } else {
                 throw new Error('无效的交易索引参数');
             }
      */
        // 调用原始 JSON-RPC
        const tx = await provider.send('eth_getTransactionByBlockNumberAndIndex', [
            ethers.utils.hexValue(blockNumberParam), // 区块号（支持 "latest"）
            ethers.utils.hexValue(transactionIndexParam),     // 交易索引
        ]);
        console.log(tx, 'tx');
        return tx;

    } catch (error) {
        console.error('获取交易信息时出错:', error);
        throw error;
    }
}
/**
 * 根据交易哈希获取交易信息
 * @param request 请求对象，params[0] 为交易哈希
 */
export async function eth_getTransactionByHash(request: any) {
    debugger
    try {
        // 获取以太坊提供者实例
        const provider = await getEthersProvider();

        // 解析请求参数
        const transactionHash = request.params[0];

        if (!transactionHash) {
            throw new Error('缺少交易哈希参数');
        }

        // 根据交易哈希获取交易信息
        const transaction = await provider.getTransaction(transactionHash);

        console.log('获取到的交易信息:', transaction);
        return transaction;
    } catch (error) {
        console.error('获取交易信息时出错:', error);
        throw error;
    }
}
/**
 * 根据区块哈希获取叔块数量
 * @param request 请求对象，params[0] 为区块哈希
 */
export async function eth_getUncleCountByBlockHash(request: any) {
    try {
        const provider = await getEthersProvider();
        const blockHash = request.params[0];

        if (!blockHash) {
            throw new Error('缺少区块哈希参数');
        }

        const uncleCount = await provider.send('eth_getUncleCountByBlockHash', [blockHash]);
        console.log(`区块 ${blockHash} 的叔块数量: ${uncleCount}`);
        return uncleCount;
    } catch (error) {
        console.error('获取叔块数量时出错:', error);
        throw error;
    }
}
/**
 * 根据区块编号获取叔块数量
 * @param request 请求对象，params[0] 为区块编号
 */

export async function eth_getUncleCountByBlockNumber(request: any) {
    debugger
    try {
        const provider = await getEthersProvider();
        const blockNumberParam = request.params[0];

        if (blockNumberParam === undefined) {
            throw new Error('缺少区块编号参数');
        }

        // 处理区块编号参数，支持 'earliest'、'latest'、'pending' 等关键词，也支持数字和十六进制字符串
        let blockNumber;
        if (typeof blockNumberParam === 'string') {
            if (['earliest', 'latest', 'pending'].includes(blockNumberParam)) {
                blockNumber = blockNumberParam;
            } else {
                // 尝试将十六进制字符串转换为数字
                blockNumber = parseInt(blockNumberParam, 16);
            }
        } else if (typeof blockNumberParam === 'number') {
            blockNumber = blockNumberParam;
        } else {
            throw new Error('无效的区块编号参数');
        }

        const blockNumberHex = typeof blockNumber === 'number' ? ethers.utils.hexValue(blockNumber) : blockNumber;
        const uncleCount = await provider.send('eth_getUncleCountByBlockNumber', [blockNumberHex]);
        console.log(`区块编号 ${blockNumberHex} 的叔块数量: ${uncleCount}`);
        return uncleCount;
    } catch (error) {
        console.error('获取叔块数量时出错:', error);
        throw error;
    }
}


export async function eth_estimateGas(request: any) {
    debugger
    try {
        const provider = await getEthersProvider();
        const transaction = request.params[0];

        if (!transaction) {
            throw new Error('缺少交易对象参数');
        }

        const estimatedGas = await provider.estimateGas(transaction);
        const estimatedGasHex = ethers.utils.hexValue(estimatedGas);
        console.log('估算的 Gas 数量（十六进制）:', estimatedGasHex);
        return estimatedGasHex;
    } catch (error) {
        console.error('估算 Gas 数量时出错:', error);
        throw error;
    }
}
export async function eth_feeHistory(request: any) {
    debugger
    try {
        const provider = await getEthersProvider();
        const [blockCount, newestBlock, rewardPercentiles] = request.params;

        if (!blockCount || !newestBlock) {
            throw new Error('缺少 blockCount 或 newestBlock 参数');
        }

        const feeHistory = await provider.send('eth_feeHistory', [
            ethers.utils.hexValue(blockCount),
            newestBlock,
            rewardPercentiles
        ]);

        console.log('获取到的费用历史信息:', feeHistory);
        return feeHistory;
    } catch (error) {
        console.error('获取费用历史信息时出错:', error);
        throw error;
    }
}
export async function eth_getLogs(request: any) {
    debugger
    try {
        const provider = await getEthersProvider();
        const filter = request.params[0];

        if (!filter) {
            throw new Error('缺少日志过滤器参数');
        }

        const logs = await provider.getLogs(filter);
        console.log('获取到的日志信息:', logs);
        return logs;
    } catch (error) {
        console.error('获取日志信息时出错:', error);
        throw error;
    }
}
export async function eth_newPendingTransactionFilter(request: any) {
    console.log(request);
    try {
        const provider = await getEthersProvider();
        const filterId = await provider.send('eth_newPendingTransactionFilter', []);
        console.log('新待处理交易过滤器 ID:', filterId);
        return filterId;
    } catch (error) {
        console.error('创建新待处理交易过滤器时出错:', error);
        throw error;
    }
}
import indexDbData from '../../indexDB.js';
import { showExtensionPopup } from '../../index.ts';
import { ethers } from 'ethers';
import Web3 from 'web3';
import addEthereumChain from './addEthereumChain';
import requestPermissions from './requestPermissions';
import eth_call from './ethCall';
import eth_newBlockFilter from './eth_newBlockFilter';
import eth_gasPrice from './eth_gasPrice';
import eth_getBalance from './eth_getBalance';
import eth_syncing from './eth_syncing';
import eth_subscribe from './eth_subscribe';
import eth_sendTransaction from './sendTransaction';
import eth_getTransactionReceipt from './getTransactionReceipt';
import handleSignMessage from './handleSignMessage';
import switchEthereumChain from './switchEthereumChain';
import blockNumber from './blockNumber';

import watchAsset from './watchAsset';
import wallet_getCallsStatus from './wallet_getCallsStatus';
import {eth_getBlockByHash,eth_coinbase,eth_getFilterChanges,eth_uninstallFilter,eth_getCode,eth_getStorageAt,eth_getTransactionCount,wallet_revokePermissions,eth_getBlockTransactionCountByNumber,eth_getTransactionByBlockHashAndIndex,eth_getBlockTransactionCountByHash} from './getEtnRequest';
//   获取权限数据
function requestGetPermissions() {
    return indexDbData.getData('authorized_sites');
}

// 获取chainID
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

// 撤销当前dapp的授权
async function revokePermissions() {}



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
    eth_call,
    eth_gasPrice,
    eth_coinbase,
    eth_getBlockByHash,
    eth_newBlockFilter,
    eth_sendTransaction,
    eth_getFilterChanges,
    eth_syncing,
    eth_uninstallFilter, //这个提示 web3.eth.filter.uninstall 不存在，还有报错
    eth_getCode,
    eth_getStorageAt,
    eth_getTransactionCount,
    wallet_revokePermissions,
    wallet_getCallsStatus,
    eth_subscribe,
    eth_getBlockTransactionCountByHash,
    eth_getBlockTransactionCountByNumber,
    eth_getTransactionByBlockHashAndIndex,
    eth_getTransactionReceipt
};

import { startHeartbeat } from './resident.js';
import { roundRobin } from './indexDB.js'; ""
import web3Operate from './web3Operate.js';
import { EXTERNAL_PORT_NAME } from '../utils/provider/constants.js'
import { showExtensionPopup } from '../utils/index.js'
import indexDbData from '../utils/indexDB';
import browser from 'webextension-polyfill';
import requestMethodFn from '../utils/request/EVM/requestEVM';
import './utils';
import './test';

// 开始轮循hash状态
roundRobin()
chrome.runtime.onMessage.addListener((message, sender, sendResponse: any) => {
    // 获取密码，判断是否显示输入密码页面
    if (message.action === 'getSecret') {
        chrome.storage.local.get('secret', function (data: any) {
            console.log(data, sender, 'datadatadata');
            sendResponse(data);
        });
        return true; // 保持消息通道打开，以便异步发送响应
    }
    // 设置密码缓存
    if (message.action === 'setSecret') {
        chrome.storage.local.set({ 'secret': message.text });
    }

    // 交易转账
    if (message.action === 'transferEVM') {
        sendResponse();
        startHeartbeat();//js常驻后台
        console.log(message, 'web3Operate');
        web3Operate.evmTransfer(message)
    }
    if (message.action === 'transferUTXO') {
        sendResponse();
        startHeartbeat();//js常驻后台
        if (!message['type']) {
            console.log(web3Operate, 'web3Operate');
            web3Operate.utxoTransfer(message)
        }
        if (message['type'] && message['type'] == 'transfer') {
            console.log(web3Operate, 'web3Operate');
            web3Operate.transferUtxo(message)
        }
    }

    // 处理权限请求
    if (message.action === 'authorization_response') {
        indexDbData.getData('authorization').then(async (data: any) => {
            if (message.approved) {
                data.state = 'approved'
            } else {
                data.state = 'deny'
            }
            indexDbData.putData(data)
        })
    }
})

// 在此处执行浏览器关闭时的操作
chrome.windows.onRemoved.addListener(function () {
    console.log('浏览器即将关闭！');
    chrome.storage.local.remove('secret');
});


// 与content通信
let portConnections = new Map<string, chrome.runtime.Port>();
// 监听新的连接请求
chrome.runtime.onConnect.addListener((port) => {
    console.log('New connection:', port.name);
    // 验证连接名称
    if (port.name === EXTERNAL_PORT_NAME) {
        // 存储连接
        portConnections.set(port.name, port);
        console.log('Valid connection established', portConnections);
        // 设置消息监听器
        port.onMessage.addListener(async (message) => {
            console.log('Received message:', message);
            try {
                // 处理不同的请求类型
                if (message.request) {
                    const response = await handleProviderRequest(message.request);
                    port.postMessage({
                        type: message.request.method,
                        accounts: response
                    });
                } else {
                    // 转发消息到所有标签页，实现popup到dapp的通信
                    sendMessageToAllTabs({
                        action: 'send_to_dapp',
                        data: message.data
                    });
                }
            } catch (error: any) {
                console.error('Error handling message:', error);
                port.postMessage({
                    type: 'error',
                    error: error.message
                });
            }
        });

        // 处理断开连接
        port.onDisconnect.addListener(() => {
            console.log('Connection disconnected:', port.name);
            portConnections.delete(port.name);
        });
    }
});

// 处理 provider 请求
async function handleProviderRequest(request: any) {
    console.log(request, "request+");

    switch (request.method) {
        // 因为 DApp 在初始化时会自动调用 eth_requestAccounts 来检查是否已连接钱包，所以这里需要处理一下
        case 'eth_requestAccounts':
            let wallt = await indexDbData.getData('currentWalltAddress');
            return [wallt?.address];
        // }else{
        // return await requestAccountsWallt(request);
        // }
        case 'wallet_requestPermissions':
            return await requestMethodFn.requestPermissions(request);
        case "wallet_getPermissions":
            return await requestMethodFn.requestGetPermissions();
        case 'eth_chainId':
            return await requestMethodFn.getChainId();
        case 'eth_call':
            return await requestMethodFn.eth_call(request);
        case 'eth_blockNumber':
            return await requestMethodFn.blockNumber();
        case 'web3_clientVersion':
            return await requestMethodFn.getWalltVersion();
        case 'personal_sign':
            return await requestMethodFn.handleSignMessage(request);
        case 'wallet_addEthereumChain':
            return await requestMethodFn.addEthereumChain(request);
        case 'wallet_watchAsset':
            return await requestMethodFn.watchAsset(request);
        case "eth_getBalance":
            return await requestMethodFn.eth_getBalance(request);
        case "eth_sendTransaction":
            return await requestMethodFn.eth_sendTransaction(request);
        case "eth_gasPrice":
            return await requestMethodFn.eth_gasPrice(request);
        case "wallet_switchEthereumChain":
            return await requestMethodFn.switchEthereumChain(request);
        case "eth_getBlockByHash":
            return await requestMethodFn.eth_getBlockByHash(request);
        case "eth_coinbase":
            return await requestMethodFn.eth_coinbase(request);
        case "eth_newBlockFilter":
            return await requestMethodFn.eth_newBlockFilter(request);
        case "eth_getFilterChanges":
            return await requestMethodFn.eth_getFilterChanges(request);
        case "eth_syncing":
            return await requestMethodFn.eth_syncing(request);
        case "eth_uninstallFilter":
            return await requestMethodFn.eth_uninstallFilter(request);
        case "eth_getCode":
            return await requestMethodFn.eth_getCode(request);
        case "eth_getStorageAt":
            return await requestMethodFn.eth_getStorageAt(request);
        case "eth_getTransactionCount":
            return await requestMethodFn.eth_getTransactionCount(request);
        case "wallet_revokePermissions":
            return await requestMethodFn.wallet_revokePermissions(request);
        case "wallet_getCallsStatus":
            return await requestMethodFn.wallet_getCallsStatus(request);
        case "eth_subscribe":
            return await requestMethodFn.eth_subscribe(request);
        case "eth_getBlockTransactionCountByHash":
            return await requestMethodFn.eth_getBlockTransactionCountByHash(request);
        case "eth_getBlockTransactionCountByNumber":
            return await requestMethodFn.eth_getBlockTransactionCountByNumber(request);
        case "eth_getTransactionByBlockHashAndIndex":
            return await requestMethodFn.eth_getTransactionByBlockHashAndIndex(request);
        case "eth_getBlockByNumber":
            return await requestMethodFn.eth_getBlockByNumber(request);
        case "eth_getTransactionByBlockNumberAndIndex":
            return await requestMethodFn.eth_getTransactionByBlockNumberAndIndex(request);
        case "eth_getTransactionByHash":
            return await requestMethodFn.eth_getTransactionByHash(request);

        case "eth_getUncleCountByBlockHash":
            return await requestMethodFn.eth_getUncleCountByBlockHash(request);
        case "eth_getUncleCountByBlockNumber":
            return await requestMethodFn.eth_getUncleCountByBlockNumber(request);
        case 'account_chainId':
            return await account_chainId(request);
        default:
            throw new Error(`Method not supported: ${request.method}`);
    }
}
// 更新accounts和chainId
async function account_chainId (message: any){
    try {
        let rpcData: any = await indexDbData.getData('rpc_url');
        return new Promise((resolve, reject) => {
            if (rpcData) {
                // 将 CHAIN_ID 转换为十六进制
                const hexChainId = `0x${Number(rpcData.CHAIN_ID).toString(16)}`;
                const accounts = [rpcData.walltInfo[0].address]
                resolve({accounts:accounts, chainId: hexChainId});
            } else {
                reject(new Error('RPC URL not found'));
            }
        });
    } catch {}
}
// 发送消息到所有标签页的函数
function sendMessageToAllTabs(message: any) {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab: any) => {
            console.log(tab.id, "tabtabtabtabtabtabtab", message.data);
            chrome.tabs.sendMessage(tab.id, message, {}, (response) => {
                console.log(response, 'response');
                let chromeInfo: any = chrome.runtime;
                if (chromeInfo.lastError) {
                    console.error('Failed to send message to tab:', chromeInfo.lastError);
                }
            });
        });
    });
}

// 处理账户请求
async function requestAccountsWallt(params: any) {
    console.log(params, "params");
    // 获取当前活动标签页
    const tab: any = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log(tab, "获取当前活动页");

    if (!tab[0]) {
        throw new Error('No active tab found');
    }
    // 获取标签页的 URL
    const currentUrl = new URL(tab[0].url).origin;

    const currentWalltAddress = await indexDbData.getData('currentWalltAddress') || {};
    const rpc_url = await indexDbData.getData('rpc_url') || {};
    // 检查是否已有授权
    const authorizedSites = await indexDbData.getData('authorized_sites') || {};
    if (authorizedSites && authorizedSites[currentUrl]) {
        // 已授权，直接返回账户
        const accounts = await indexDbData.getData('currentWalltAddress');
        return accounts.address;
    } else {
        // 缓存当前dapp的页面数据
        let dappPermission = {
            id: 'authorization',
            key: 'string',
            origin: params.windowInfo[2],
            faviconUrl: params.windowInfo[1],
            chainID: rpc_url.CHAIN_ID,
            title: params.windowInfo[0],
            state: null,
            blance: currentWalltAddress.blance,
            unit: rpc_url.unit,
            userName: currentWalltAddress.userName,
            accountAddress: currentWalltAddress.address
        }
        console.log(dappPermission, "dappPermission");
        indexDbData.putData(dappPermission)
    }
}


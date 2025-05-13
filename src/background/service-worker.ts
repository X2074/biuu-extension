import { startHeartbeat } from './resident.js';
import { roundRobin } from './indexDB.js'; ""
import web3Operate from './web3Operate.js';
import { EXTERNAL_PORT_NAME } from '../utils/provider/constants.js'
import { showExtensionPopup } from '../utils/index.js'
import indexDbData from '../utils/indexDB';
import browser from 'webextension-polyfill';
import { requestPermissions, requestAccountsWallt } from '../utils/request';
import './utils';
import './test';

// 开始轮循hash状态
roundRobin()
chrome.runtime.onMessage.addListener((message, sender, sendResponse: any) => {
    // 获取密码，判断是否显示输入密码页面
    if (message.action === 'getSecret') {
        chrome.storage.local.get('secret', function (data: any) {
            console.log(data, 'datadatadata');
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
    if (message.action === 'test') {
        console.log("service-worker接收到content的数据");
        let aaa = { action: 'service', test: 'service-worker传递数据给content' }
        sendResponse(aaa);
        return true; // 保持消息通道打开，以便异步发送响应
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
            console.log('Received message:', message.request);
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
                        action: 'accounts_selected',
                        data: {
                            accounts: message.data.accounts,
                            selectedAccount: message.data.selectedAccount,
                            message: message.data.message,
                            tabId: message.data.tab.id
                        }
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
            // 检查是否是初始化请求
            // if (request.params && request.params.length === 0) {
            let wallt = await indexDbData.getData('currentWalltAddress');
            // 处理账户请求
            return [wallt.address];
        // }else{
        //     return await requestAccountsWallt(request);
        // }
        case 'wallet_requestPermissions':
            return await requestPermissions(request);
        case "wallet_getPermissions":
            return await requestGetPermissions();
        case 'eth_chainId':
            return await getChainId();
        case 'personal_sign':
            return await handleSignMessage(request);
        default:
            throw new Error(`Method not supported: ${request.method}`);
    }
}

// 获取账户
async function requestAccounts(params: any[]) {
    console.log('requestAccounts', params);
    showExtensionPopup('/secret')
    // 这里实现账户请求逻辑
    // return ['0x1234567890123456789012345678901234567890'];
}

// 获取 chainId
async function getChainId() {
    console.log('getChainId');
    return '0x1'; // 以太坊主网
}


// 发送消息到所有标签页的函数
function sendMessageToAllTabs(message: any) {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab: any) => {
            console.log(tab.id, "tabtabtabtabtabtabtab", message.data.tabId);
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

// 添加处理签名请求的函数
async function handleSignMessage(request: any) {
    const [message, address] = request.params || [];

    // 获取当前活动标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) {
        throw new Error('Unable to determine the current tab URL');
    }

    const currentOrigin = new URL(tab.url).origin;
    // 创建签名弹窗
    let url: any = `/sign?message=${encodeURIComponent(message)}&address=${address}&origin=${encodeURIComponent(currentOrigin)}`;
    let popupUrl: any = await showExtensionPopup(url);  
    const popup = await chrome.windows.create({
        // url: chrome.runtime.getURL(`popup/index.html#/sign?message=${encodeURIComponent(message)}&address=${address}&origin=${encodeURIComponent(currentOrigin)}`),
        url: popupUrl,
        type: 'popup',
        width: 400,
        height: 600
    });
    // let url = chrome.runtime.getURL(`popup/index.html#/sign?message=${encodeURIComponent(message)}&address=${address}&origin=${encodeURIComponent(currentOrigin)}`);
    // const popup = await showExtensionPopup(url)

    // 返回一个 Promise，等待用户响应
    return new Promise((resolve, reject) => {
        const handleMessage:any = (message: any) => {
            console.log(message, "messagehandleMessage");

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
}


//   获取权限数据
async function requestGetPermissions() {
    try {
        let authorized = await indexDbData.getData('authorized_sites');
        return new Promise((resolve, reject) => {
            if (authorized) {
                resolve(authorized);
            } else {
                reject(new Error('No permissions found'));
            }
        });
    } catch {

    }
}
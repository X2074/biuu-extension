import { startHeartbeat } from './resident.js';
import { roundRobin } from './indexDB.js'; ""
import web3Operate from './web3Operate.js';
import { EXTERNAL_PORT_NAME } from '../utils/provider/constants.js'
import { showExtensionPopup } from '../utils/index.js'
import indexDbData from '../utils/indexDB';
import {requestPermissions,requestAccountsWallt} from '../utils/request';
import browser from 'webextension-polyfill';

// 开始轮循hash状态
roundRobin()
chrome.runtime.onMessage.addListener((message, sender, sendResponse: any) => {
    console.log(sender,"sender");
    
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
        indexDbData.getData('authorized_sites').then(async (data: any) => {
            if (message.approved) {
                data.state = 'approved'
            }else{
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
        console.log('Valid connection established',portConnections);
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
                }else{
                    // 转发消息到所有标签页，实现popup到dapp的通信
                    sendMessageToAllTabs({
                        action: 'accounts_selected',
                        data: {
                            accounts: message.data.accounts,
                            selectedAccount: message.data.selectedAccount,
                            message: message.data.message,
                            tabId:message.data.tab.id
                        }
                    }); 
                }
            } catch (error:any) {
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
    console.log(request,"request+");
    
    switch (request.method) {
        case 'eth_requestAccounts':
            return await requestAccountsWallt(request);
        case 'wallet_requestPermissions':
            return await requestPermissions(request);
        case 'eth_chainId':
            return await getChainId();
        default:
            throw new Error(`Method not supported: ${request.method}`);
    }
}
// 获取 chainId
async function getChainId() {
    console.log('getChainId');
    return '0x1'; // 以太坊主网
}


// 发送消息到所有标签页的函数
function sendMessageToAllTabs(message: any) {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab:any) => {
            console.log(tab.id,"tabtabtabtabtabtabtab",message.data.tabId);
            chrome.tabs.sendMessage(tab.id, message, {},(response) => {
                console.log(response,'response');
                
                let chromeInfo:any = chrome.runtime;
                if (chromeInfo.lastError) {
                    console.error('Failed to send message to tab:', chromeInfo.lastError);
                }
            });
        });
    });
}


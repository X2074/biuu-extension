import { startHeartbeat } from './resident.js';
import { roundRobin } from './indexDB.js'; ""
import web3Operate from './web3Operate.js';
import { EXTERNAL_PORT_NAME } from '../utils/provider/constants.js'
import { showExtensionPopup } from '../utils/index.js'
import indexDbData from '../utils/indexDB';
import browser from 'webextension-polyfill';
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
            }else{
                data.state = 'deny'
            }
            indexDbData.putData(data)
        })
        // // 显示权限请求弹窗
        // chrome.windows.create({
        //     url: chrome.runtime.getURL('popup/permissions.html'),
        //     type: 'popup',
        //     width: 400,
        //     height: 300
        // }, (window) => {
        //     // 将权限请求信息传递给弹窗
        //     chrome.tabs.sendMessage(window.tabs[0].id, {
        //         action: 'set_permissions_request',
        //         permissions: message.permissions
        //     });
        // });
        
        // // 等待用户响应
        // return true; // 表示需要异步处理
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
        case 'eth_chainId':
            return await getChainId();
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


// 处理账户请求
async function requestAccountsWallt(params: any) {
    console.log(params,"params");
    // 获取当前活动标签页
    const tab:any = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log(tab,"获取当前活动页");
    
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
    }else{

        // 缓存当前dapp的页面数据
        let dappPermission = {
            id:'authorization',
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
        console.log(dappPermission,"dappPermission");
        indexDbData.putData(dappPermission)
        // 创建授权弹窗
        const popup:any = await showExtensionPopup('/connect')
        console.log(popup,'popup');
        // // 等待用户响应
        // const listener = (request: any, sender: any, sendResponse: any) => {
        //     if (request.type === 'permissionResponse') {
        //       if (request.granted) {
        //         // 保存权限
        //         const chainId = permission.chainID;
        //         const address = permission.accountAddress;
        //         const origin = permission.origin;
                
        //         if (!permissions.value.evm[chainId]) {
        //           permissions.value.evm[chainId] = {};
        //         }
        //         if (!permissions.value.evm[chainId][address]) {
        //           permissions.value.evm[chainId][address] = {};
        //         }
        //         permissions.value.evm[chainId][address][origin] = {
        //           ...permission,
        //           state: 'allow'
        //         };
        //       }
        //       resolve();
        //     }
        //   };
          browser.runtime.onMessage.addListener((request: any) => {
            console.log(request,'request');
            
          });
  
        
        // 将请求信息传递给弹窗
        // await chrome.tabs.sendMessage(popup.tabs[0].id, {
        //     action: 'set_authorization_request',
        //     url: currentUrl
        // });

    }
}


/* 接收 wallet_requestPermissions 请求，并从中提取请求的权限参数
    获取当前活动标签页的 URL 和 origin
    创建一个授权弹窗，将当前 origin 作为参数传递
    等待用户响应（授权或拒绝）
    如果用户授权，将权限信息保存到 IndexedDB
    返回符合 EIP-2255 标准的权限响应
*/
async function requestPermissions(request: any) {
    try {
      const { params } = request;
      const [permissions] = params || [{}];
      
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) {
        throw new Error('Unable to determine the current tab URL');
      }
  
      const currentOrigin = new URL(tab.url).origin;
      
      // 创建授权弹窗
      const popup = await chrome.windows.create({
        url: chrome.runtime.getURL('popup/index.html#/connect') + 
             `?origin=${encodeURIComponent(currentOrigin)}`,
        type: 'popup',
        width: 400,
        height: 600
      });
  
      // 返回一个 Promise，等待用户响应
      return new Promise((resolve, reject) => {
        // 监听来自弹窗的响应
        const handleMessage = (message: any) => {
            console.log(message,"messagemessagemessage");
            
          if (message.action === 'authorization_response') {
            // 清理消息监听
            chrome.runtime.onMessage.removeListener(handleMessage);
            
            if (message.approved) {
              // 用户已授权，保存权限信息
              indexDbData.getData('authorized_sites').then((sites: any) => {
                const authorizedSites = sites || {};
                authorizedSites[currentOrigin] = {
                  permissions: Object.keys(permissions),
                  timestamp: Date.now()
                };
                
                return indexDbData.putData({
                  id: 'authorized_sites',
                  content: authorizedSites
                });
              }).then(() => {
                // 返回符合 EIP-2255 的响应
                resolve([{
                  parentCapability: 'eth_accounts',
                  invoker: currentOrigin,
                  caveats: [
                    {
                      type: 'filterResponse',
                      value: [message.account || ''] // 使用从弹窗返回的账户地址
                    }
                  ]
                }]);
              }).catch((error: any) => {
                console.error('Error saving permissions:', error);
                reject(new Error('Failed to save permissions'));
              });
            } else {
              reject(new Error('User rejected the request'));
            }
          }
        };
  
        // 添加消息监听
        chrome.runtime.onMessage.addListener(handleMessage);
  
        // 设置超时
        setTimeout(() => {
          chrome.runtime.onMessage.removeListener(handleMessage);
          reject(new Error('Request timeout'));
        }, 300000); // 5分钟超时
      });
    } catch (error) {
      console.error('Error in requestPermissions:', error);
      throw error;
    }
  }
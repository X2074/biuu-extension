import indexDbData from './indexDB.js';
// 从dapp发送消息到background，background响应消息到dapp
const requestContentScript = (method,params)=>{
	return new Promise((resolve, reject) => {
		// 发送请求到 content script
		window.postMessage({
			target: 'biuu-provider-bridge',
			request: {
			  method,
			  params
			}
		  }, '*');
	
		  // 监听响应
		  const listener = (event: MessageEvent) => {
			console.log(event,"event465465");
			if (event.data.target === 'biuu-window-provider') {
			  window.removeEventListener('message', listener);
			  if (event.data.type === method) {
				resolve(event.data.accounts);
			  } else {
				reject(new Error('Request failed'));
			  }
			}
		  };
	
		  window.addEventListener('message', listener);      
	});
}

/* 接收 wallet_requestPermissions 请求，并从中提取请求的权限参数
    获取当前活动标签页的 URL 和 origin  属性
    创建一个授权弹窗，将当前 origin 作为参数传递
    等待用户响应（授权或拒绝）
    如果用户授权，将权限信息保存到 IndexedDB
    返回符合 EIP-2255 标准的权限响应
*/
export async function requestPermissions(request: any) {
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
                authorizedSites['id'] = 'authorized_sites';
                authorizedSites[currentOrigin] = {
                  permissions: Object.keys(permissions),
                  timestamp: Date.now()
                };
                
                return indexDbData.putData(authorizedSites);
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

 // 处理账户请求
  export async function requestAccountsWallt(params: any) {
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
      const accounts = await indexDbData.getData('currentWalltAddress');
      if (authorizedSites && authorizedSites[currentUrl]) {
          // 已授权，直接返回账户
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
          return accounts.address;
  
      }
  }
// EIP1193Provider.ts
import { WalletProvider } from "../../utils/types"
import indexDbData from "../../utils/indexDB.js"
// 首先定义 EIP-1193 Provider 的类型
export interface EthereumProvider {
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(eventName: string, listener: (...args: any[]) => void): void;
  disconnect(): void;
  accounts: string[];
  chainId: string;
  accountsChanged: (accounts: string[]) => void;
  chainChanged: (chainId: string) => void;
  disconnect: () => void;
  providerInfo: {
    label: string;
    injectedNamespace: string;
    identityFlag: string;
    checkIdentity: (provider: WalletProvider) => boolean;
  };
}
// Provider 信息配置，用于判断钱包的身份标识
export const providerInfo = {
  label: 'BIUU',
  injectedNamespace: 'BIUU-Chrome-Extension',
  identityFlag: 'isBIUU',
  checkIdentity: (provider: WalletProvider) =>
    !!provider && !!provider.isAAExtension,
} as const;

// 创建 EIP-1193 兼容的 provider
export const createEIP1193Provider = (): EthereumProvider => {
  const provider: EthereumProvider = {
    accounts: [],
    chainId: '0x1',
    providerInfo,
    request: async (args: { method: string; params?: any[] }) => {
      const { method, params } = args;
      try {
        switch (method) {
          case 'eth_requestAccounts':
            return requestContentScript(method,params);
          case 'eth_chainId':
            return provider.chainId;
			case 'wallet_getPermissions':
            return await getPermissions();
          case 'wallet_requestPermissions':
            return await requestContentScript(method,params);
          default:
            throw new Error(`Method not supported: ${method}`);
        }
      } catch (error) {
        console.error('Request failed:', error);
        throw error;
      }
    },
    
    on: (eventName: string, listener: (...args: any[]) => void) => {
      // 创建事件监听器
      const eventListeners:any = {
          accountsChanged: new Set<(...args: any[]) => void>(),
          chainChanged: new Set<(...args: any[]) => void>(),
          disconnect: new Set<(...args: any[]) => void>(),
          message: new Set<(...args: any[]) => void>()
      };
      console.log(eventName,"eventNameeventNameeventName");
      
      
      if (eventListeners[eventName]) {
          eventListeners[eventName].add(listener);
          
          // 创建消息监听器
          const messageListener = (event: MessageEvent) => {
              if (event.data.type === `eip1193:${eventName}`) {
                  listener(event.data.detail);
              }
          };
          
          window.addEventListener('message', messageListener);
          
          return () => {
              eventListeners[eventName].delete(listener);
              window.removeEventListener('message', messageListener);
          };
      }
    },
    disconnect: () => {
      provider.accounts = [];
      provider.chainId = '';
      window.dispatchEvent(new CustomEvent("eip1193:disconnect", {
        detail: { code: 1000, message: 'User disconnected' }
      }));
    },
    accountsChanged: (accounts: string[]) => {
      console.log('Accounts changed:', accounts);
      provider.accounts = accounts;
      window.dispatchEvent(new CustomEvent("eip1193:accountsChanged", {
        detail: accounts
      }));
    },
    chainChanged: (chainId: string) => {
      console.log('Chain changed:', chainId);
      provider.chainId = chainId;
      window.dispatchEvent(new CustomEvent("eip1193:chainChanged", {
        detail: chainId
      }));
    },
  };
  return provider;
};
const requestContentScript = (method:any,params:any)=>{
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

const getPermissions = ()=>{
  return indexDbData.getData('authorized_sites')
}



// 事件处理函数
export const setupEIP1193Events = (provider: EthereumProvider) => {
  // 处理账户变化事件
  window.addEventListener("eip1193:accountsChanged", (event) => {
    const accounts = (event as CustomEvent<string[]>).detail;
    provider.accounts = accounts;
  });

  // 处理链变化事件
  window.addEventListener("eip1193:chainChanged", (event) => {
    const chainId = (event as CustomEvent<string>).detail;
    provider.chainId = chainId;
  });

  // 处理断开连接事件
  window.addEventListener("eip1193:disconnect", (event) => {
    console.log(event, 'disconnect');

    provider.disconnect();
  });

  // 返回清理函数
  return () => {
    // 清理事件监听器
    window.removeEventListener("eip1193:accountsChanged", (event) => {
      console.log(event, 'accountsChanged');
    });
    window.removeEventListener("eip1193:chainChanged", (event) => {
      console.log(event, 'chainChanged');
    });
    window.removeEventListener("eip1193:disconnect", (event) => {
      console.log(event, 'disconnect');
    });
  };
};

// 创建并配置 provider
export const eip1193Provider = createEIP1193Provider();
export const cleanupEIP1193 = setupEIP1193Events(eip1193Provider);
// EIP1193Provider.ts
import { WalletProvider } from "./types"
// 首先定义 EIP-1193 Provider 的类型
export interface EthereumProvider {
  request(args: { method: string; params?: any[] }): Promise<any>;
  disconnect(): void;
  accounts: string[];
  chainId: string;
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
      request: async (args: { method: string; params?: any }) => {
          const { method, params } = args;
          
          switch (method) {
              case 'eth_requestAccounts':
                  // 1. 获取 DApp 的信息
            const dappInfo = {
              title: params?.[0],  // 第一个参数是 DApp 标题
              icon: params?.[1]    // 第二个参数是 DApp 图标
          };

          // 2. 通过 window.postMessage 发送请求
          return new Promise((resolve, reject) => {
              const listener = (event: MessageEvent) => {
                  if (event.data.type === 'accounts_response') {
                      window.removeEventListener('message', listener);
                      resolve(event.data.accounts);
                  }
              };

              window.addEventListener('message', listener);

              // 3. 发送请求
              window.postMessage({
                  target: 'biuu-provider-bridge',
                  request: {
                      method: 'eth_requestAccounts',
                      params
                  }
              }, '*');
          });
              case 'eth_chainId':
                  return provider.chainId;
              default:
                  throw new Error(`Method not supported: ${method}`);
          }
      },
      disconnect: () => {
          provider.accounts = [];
          provider.chainId = '';
          window.dispatchEvent(new CustomEvent("eip1193:disconnect", {
              detail: { code: 1000, message: 'User disconnected' }
          }));
      },
      providerInfo
  };

  return provider;
};

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
    console.log(event,'disconnect');
    
      provider.disconnect();
  });

  // 返回清理函数
  return () => {
      // 清理事件监听器
      window.removeEventListener("eip1193:accountsChanged", (event) => {
        console.log(event,'accountsChanged');});
      window.removeEventListener("eip1193:chainChanged", (event) => {
        console.log(event,'chainChanged');});
      window.removeEventListener("eip1193:disconnect", (event) => {
        console.log(event,'disconnect');});
  };
};

// 创建并配置 provider
export const eip1193Provider = createEIP1193Provider();
export const cleanupEIP1193 = setupEIP1193Events(eip1193Provider);




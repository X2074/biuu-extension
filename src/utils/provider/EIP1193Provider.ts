// EIP1193Provider.ts

// 首先定义 EIP-1193 Provider 的类型
export interface EthereumProvider {
  request(args: { method: string; params?: any[] }): Promise<any>;
  disconnect(): void;
  accounts: string[];
  chainId: string;
}

// 创建 EIP-1193 兼容的 provider
export const createEIP1193Provider = (): EthereumProvider => {
  const provider: EthereumProvider = {
      accounts: [],
      chainId: '0x1',
      request: async (args: { method: string; params?: any[] }) => {
          const { method, params } = args;
          
          switch (method) {
              case 'eth_requestAccounts':
                  return ['0x1234567890123456789012345678901234567890'];
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
      }
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

import { EIP1193Adapter } from './EIP1193Adapter';

// 存储端口连接
let providerPort: chrome.runtime.Port | null = null;
let provider: EthereumProvider | null = null;
export function windowProvider() {
  // 创建 provider 实例
  provider = new EIP1193Adapter({
    chainId: '0x1',
    accounts: [],
    request: async (args) => {
      // 这里需要实现实际的请求处理逻辑
      // 通过providerPort与background通信
      if (providerPort) {
        const response = await new Promise((resolve, reject) => {
          providerPort.postMessage(args);
          providerPort.onMessage.addListener((data) => {
            if (data.id === args.id) {
              resolve(data.result);
            }
          });
        });
        return response;
      }
      throw new Error('Provider port not connected');
    },
    label: 'biuu-external',
    injectedNamespace: 'biuu-external',
    identityFlag: 'biuu-external',
    checkIdentity: (provider: EthereumProvider) => {
      return provider.providerInfo?.name === 'biuu-external';
    },
    name: 'biuu-external',
    version: '1.0.0'
  });
  console.log(provider,"providerproviderproviderprovider");

  // 检查是否已定义 window.ethereum
  if (!window.ethereum) {
    // 使用 Object.defineProperty 注入 provider
    Object.defineProperty(window, 'ethereum', {
        value: provider,
        writable: false,
        configurable: false
    });
  } else {
    // 如果已存在，直接赋值
    window.ethereum = provider;
  }
}
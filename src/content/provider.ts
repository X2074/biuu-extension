import { EventEmitter } from 'events';

class BiuuProvider extends EventEmitter {
  private connected: boolean = false;
  private chainId: string = '0x1'; // 默认以太坊主网
  private selectedAddress: string | null = null;

  constructor() {
    super();
    this.initialize();
  }

  private async initialize() {
    // 监听来自background的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'accountsChanged') {
        this.selectedAddress = message.address;
        this.emit('accountsChanged', [message.address]);
      } else if (message.type === 'chainChanged') {
        this.chainId = message.chainId;
        this.emit('chainChanged', message.chainId);
      }
      sendResponse({ received: true });
      return true;
    });

    // 获取当前账户状态
    const response = await chrome.runtime.sendMessage({ method: 'eth_accounts' });
    if (response && response.result) {
      this.selectedAddress = response.result[0];
    }
  }

  // 基本RPC方法实现
  async request(payload: { method: string; params?: any[] }) {
    if (!payload.method) {
      throw new Error('Method is required');
    }

    // 特殊处理一些方法
    switch (payload.method) {
      case 'eth_requestAccounts':
        return this.requestAccounts();
      case 'eth_accounts':
        return this.getAccounts();
      case 'eth_chainId':
        return this.getChainId();
      default:
        // 其他方法转发到background处理
        return this.sendToBackground(payload);
    }
  }

  private async requestAccounts(): Promise<string[]> {
    const response = await chrome.runtime.sendMessage({
      method: 'eth_requestAccounts',
    });
    if (response.error) {
      throw new Error(response.error.message);
    }
    this.connected = true;
    this.selectedAddress = response.result[0];
    this.emit('accountsChanged', [this.selectedAddress]);
    return [this.selectedAddress];
  }

  private async getAccounts(): Promise<string[]> {
    return this.selectedAddress ? [this.selectedAddress] : [];
  }

  private async getChainId(): Promise<string> {
    return this.chainId;
  }

  private async sendToBackground(payload: any): Promise<any> {
    try {
      const response = await chrome.runtime.sendMessage(payload);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.result;
    } catch (error) {
      throw new Error('Failed to send message to background');
    }
  }
}

// 注入provider到window对象
export function injectProvider() {
  const provider = new BiuuProvider();

  // 注入ethereum provider
  const ethereum = {
    isMetaMask: false,
    isBiuu: true,
    isConnected: () => provider.connected,
    request: (payload: { method: string; params?: any[] }) => provider.request(payload),
    on: (eventName: string, handler: (...args: any[]) => void) => provider.on(eventName, handler),
    removeListener: (eventName: string, handler: (...args: any[]) => void) => provider.removeListener(eventName, handler),
  };

  // 注入到window对象
  window.ethereum = ethereum;
}

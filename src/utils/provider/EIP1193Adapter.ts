import { EthereumProvider, EthereumProviderEventMap } from '@/types/eip1193';
import { store } from './EIP1193Provider';

export class EIP1193Adapter implements EthereumProvider {
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();

  /*   constructor(private provider: EthereumProvider) {
      Object.keys(EthereumProviderEventMap).forEach(event => {
        this.eventListeners.set(event, new Set());
      });
    } */
  constructor(private provider: EthereumProvider) {
    const events = ['accountsChanged', 'chainChanged', 'disconnect', 'connect'];
    events.forEach(event => {
      this.eventListeners.set(event, new Set());
    });
  }
  // Implement chainId property
  get chainId(): any {
    return this.provider.chainId;
  }

  // Implement accounts property
  get accounts(): any {
    return this.provider.accounts;
  }

  async request(args: { method: string; params?: any[] }): Promise<any> {
    try {
      return await this.provider.request(args);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  on(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(callback);
    }
  }

  removeListener(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private formatError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error(error.message || 'Unknown error');
  }
}
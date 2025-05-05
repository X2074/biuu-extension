// EIP1193Adapter.ts
import { EthereumProvider } from '@/types/eip1193';

export class EIP1193Adapter implements EthereumProvider {
    private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
    private _providerInfo: {
        chainId: string;
        accounts: string[];
        request: (args: { method: string; params?: any[] }) => Promise<any>;
        label: string;
        injectedNamespace: string;
        identityFlag: string;
        checkIdentity: (provider: EthereumProvider) => boolean;
        name: string;
        version: string;
    };

    constructor(providerInfo: {
        chainId?: string;
        accounts?: string[];
        request?: (args: { method: string; params?: any[] }) => Promise<any>;
        label: string;
        injectedNamespace: string;
        identityFlag: string;
        checkIdentity: (provider: EthereumProvider) => boolean;
        name: string;
        version: string;
    }) {
        this._providerInfo = {
            chainId: providerInfo.chainId || '0x1',
            accounts: providerInfo.accounts || [],
            request: providerInfo.request || ((args) => Promise.reject(new Error('Request not implemented'))),
            label: providerInfo.label,
            injectedNamespace: providerInfo.injectedNamespace,
            identityFlag: providerInfo.identityFlag,
            checkIdentity: providerInfo.checkIdentity,
            name: providerInfo.name,
            version: providerInfo.version
        };
        const events = ['accountsChanged', 'chainChanged', 'disconnect', 'connect'];
        events.forEach(event => {
            this.eventListeners.set(event, new Set());
        });
    }

    // Implement chainId property
    get chainId(): string {
        return this._providerInfo.chainId;
    }

    // Implement accounts property
    get accounts(): string[] {
        return this._providerInfo.accounts;
    }

    // Implement providerInfo property
    get providerInfo(): {
        chainId: string;
        accounts: string[];
        request: (args: { method: string; params?: any[] }) => Promise<any>;
        label: string;
        injectedNamespace: string;
        identityFlag: string;
        checkIdentity: (provider: EthereumProvider) => boolean;
        name: string;
        version: string;
    } {
        return this._providerInfo;
    }

    async request(args: { method: string; params?: any[] }): Promise<any> {
        try {
            if (args.method === 'wallet_requestPermissions') {
                // 处理权限请求
                const permissions = args.params?.[0]?.[0] || {};
                
                // 发送消息到 background 请求用户授权
                return new Promise((resolve, reject) => {
                    chrome.runtime.sendMessage(
                        {
                            action: 'request_permissions',
                            permissions: permissions
                        },
                        (response) => {
                            if (chrome.runtime.lastError) {
                                reject(new Error(chrome.runtime.lastError.message));
                                return;
                            }
                            resolve(response);
                        }
                    );
                });
            }
            
            if (args.method === 'wallet_getDappInfo') {
                // 返回当前 DApp 信息
                return {
                    title: window.document.title,
                    url: window.location.href,
                    favicon: window.document.querySelector('link[rel="icon"]')?.href
                };
            }
            
            return await this._providerInfo.request(args);
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

    emit(event: string, data: any): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(listener => listener(data));
        }
    }

    private formatError(error: any): Error {
        if (error instanceof Error) {
            return error;
        }
        return new Error(typeof error === 'string' ? error : 'Unknown error');
    }
}
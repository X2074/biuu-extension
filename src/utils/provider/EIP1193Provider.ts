// EIP1193Provider.ts
import { WalletProvider } from '../../utils/types';
import { getChainIdFromBackground } from '../backgroundBridge';
// import indexDbData from "../../utils/indexDB.js"
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
    checkIdentity: (provider: WalletProvider) => !!provider && !!provider.isAAExtension
} as const;

// 创建 EIP-1193 兼容的 provider
let _internalChainId: string | null = null;
let _internalAccounts: array<string> | null = null;
export const createEIP1193Provider = (): EthereumProvider => {
    // 使用闭包保存内部状态
    let _isInitialized = false;
    const provider: EthereumProvider = {
        // accounts: [],
        // chainId: '0x1',

        // _isInitialized: false,
        providerInfo,
        // 使用getter和setter
        get chainId() {
            return _internalChainId || '0x1';
        },
        // 使用getter和setter
        get accounts() {
            return _internalAccounts || '0x1';
        },

        set chainId(value: string) {
            if (_internalChainId !== value) {
                _internalChainId = value; // 更新内部变量=
            }
        },

        set accounts(value: string) {
            if (_internalAccounts !== value) {
                _internalAccounts = value; // 更新内部变量
            }
        },
        // 初始化方法
        async _initialize() {
            if (_isInitialized) return;

            try {
                const data: any = await getChainIdFromBackground();
                this.chainId = data.chainId;
                this.accounts = data.accounts;
                _isInitialized = true;
            } catch (error) {
                _isInitialized = true;
                console.error('Failed to initialize chainId:', error);
            }
        },
        request: async (args: { method: string; params?: any[] }) => {
            const { method, params } = args;
            console.log(method, '触发的request方法');

            try {
                switch (method) {
                    case 'wallet_getPermissions':
                    case 'wallet_requestPermissions':
                    case 'wallet_switchEthereumChain':
                    case 'wallet_addEthereumChain':
                    case 'wallet_watchAsset':
                    case 'wallet_revokePermissions':
                    case 'wallet_getCallsStatus':
                    case 'eth_requestAccounts':
                    case 'eth_chainId':
                    case 'eth_call':
                    case 'eth_blockNumber':
                    case 'eth_sendTransaction':
                    case 'eth_getBalance':
                    case 'eth_gasPrice':
                    case 'eth_getBlockByHash':
                    case 'eth_coinbase':
                    case 'eth_newBlockFilter':
                    case 'eth_getFilterChanges':
                    case 'eth_syncing':
                    case 'eth_uninstallFilter':
                    case 'eth_getCode':
                    case 'eth_getStorageAt':
                    case 'eth_getTransactionCount':
                    case 'eth_subscribe':
                    case 'eth_getBlockTransactionCountByHash':
                    case 'eth_getBlockTransactionCountByNumber':
                    case 'eth_getTransactionByBlockHashAndIndex':
                    case 'eth_getTransactionByBlockNumberAndIndex':
                    case 'eth_getTransactionReceipt':
                    case 'eth_getBlockByNumber':
                    case 'eth_getTransactionByHash':
                    case 'eth_getUncleCountByBlockHash':
                    case 'eth_getUncleCountByBlockNumber':
                    case 'eth_sendRawTransaction':
                    case 'eth_estimateGas':
                    case 'eth_feeHistory':
                        return await requestContentScript(method, params);
                    case 'personal_sign':
                        return await handlePersonalSign(params?.[0], params?.[1]);
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
            const eventListeners: any = {
                accountsChanged: new Set<(...args: any[]) => void>(),
                chainChanged: new Set<(...args: any[]) => void>(),
                disconnect: new Set<(...args: any[]) => void>(),
                message: new Set<(...args: any[]) => void>()
            };
            console.log(eventName, 'eventNameeventNameeventName');

            if (eventListeners[eventName]) {
                eventListeners[eventName].add(listener);

                // 创建消息监听器
                const messageListener = (event: MessageEvent) => {
                    if (event.data.type === `${eventName}`) {
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
            window.dispatchEvent(
                new CustomEvent('disconnect', {
                    detail: { code: 1000, message: 'User disconnected' }
                })
            );
        },
        accountsChanged: (accounts: string[]) => {
            console.log('Accounts changed:', accounts);
            provider.accounts = accounts;
            window.dispatchEvent(
                new CustomEvent('accountsChanged', {
                    detail: accounts
                })
            );
        },
        chainChanged: (chainId: string) => {
            console.log('Chain changed:', chainId);
            provider.chainId = chainId;
            window.dispatchEvent(
                new CustomEvent('chainChanged', {
                    detail: chainId
                })
            );
        }
    };
    // 初始化
    provider._initialize().catch(console.error);
    return provider;
};
const requestContentScript = (method: any, params: any) => {
    return new Promise((resolve, reject) => {
        // 发送请求到 content script
        window.postMessage(
            {
                target: 'biuu-provider-bridge',
                request: {
                    method,
                    params
                }
            },
            '*'
        );

        // 监听响应
        const listener = (event: MessageEvent) => {
            if (event.data.target === 'biuu-window-provider') {
                window.removeEventListener('message', listener);
                if (event.data.type === method && (event.data.accounts || event.data.accounts === null)) {
                    resolve(event.data.accounts);
                } else {
                    reject(event.data.error || new Error('Request failed'));
                }
            }
        };
        window.addEventListener('message', listener);
    });
};

// 事件处理函数
export const setupEIP1193Events = (provider: EthereumProvider) => {
    // 处理账户变化事件
    window.addEventListener('accountsChanged', (event) => {
        const accounts = (event as CustomEvent<string[]>).detail;
        provider.accounts = accounts;
    });

    // 处理链变化事件
    window.addEventListener('chainChanged', (event) => {
        const chainId = (event as CustomEvent<string>).detail;
        provider.chainId = chainId;
    });

    // 处理断开连接事件
    window.addEventListener('disconnect', (event) => {
        provider.disconnect();
    });

    // 返回清理函数
    return () => {
        // 清理事件监听器
        window.removeEventListener('accountsChanged', (event) => {
            console.log(event, 'accountsChanged');
        });
        window.removeEventListener('chainChanged', (event) => {
            console.log(event, 'chainChanged');
        });
        window.removeEventListener('disconnect', (event) => {
            console.log(event, 'disconnect');
        });
    };
};

// 创建并配置 provider
export const eip1193Provider = createEIP1193Provider();
export const cleanupEIP1193 = setupEIP1193Events(eip1193Provider);

// 添加处理签名的方法
const handlePersonalSign = async (message: string, address: string): Promise<string> => {
    // 检查参数
    if (!message || !address) {
        throw new Error('Invalid parameters for personal_sign');
    }
    // 发送签名请求到后台脚本
    return new Promise((resolve, reject) => {
        const requestId = Date.now().toString();
        // 监听响应
        const handleResponse = (event: MessageEvent) => {
            if (event.data.target === 'biuu-window-provider' && event.data.type === 'personal_sign') {
                window.removeEventListener('message', handleResponse);
                console.log(event, 'eventeventeventevent');

                if (event.data.error) {
                    reject(new Error(event.data.error));
                } else {
                    resolve(event.data.accounts);
                }
            }
        };

        window.addEventListener('message', handleResponse);
        // 发送签名请求
        window.postMessage(
            {
                target: 'biuu-provider-bridge',
                request: {
                    method: 'personal_sign',
                    params: [message, address],
                    requestId
                }
            },
            '*'
        );

        // 设置超时
        setTimeout(() => {
            window.removeEventListener('message', handleResponse);
            reject(new Error('Sign request timeout'));
        }, 300000); // 5分钟超时
    });
};

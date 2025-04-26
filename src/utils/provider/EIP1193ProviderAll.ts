// // EIP1193Provider.ts
// import { EthereumProvider } from "./types";

// // 错误类型定义
// export enum ProviderError {
//     USER_REJECTED_REQUEST = 4001,
//     UNAUTHORIZED = 4100,
//     UNSUPPORTED_METHOD = 4200,
//     DISCONNECTED = 4900,
//     CHAIN_DISCONNECTED = 4901
// }

// // 错误处理
// const createProviderError = (code: ProviderError, message: string): Error => {
//     const error = new Error(message);
//     (error as any).code = code;
//     return error;
// };

// // Provider 信息配置
// export const providerInfo = {
//     label: 'BIUU',
//     injectedNamespace: 'BIUU-Chrome-Extension',
//     identityFlag: 'isBIUU',
//     checkIdentity: (provider: EthereumProvider) =>
//         !!provider && !!provider.isAAExtension,
// } as const;

// // 创建 EIP-1193 兼容的 provider
// export const createEIP1193Provider = (): EthereumProvider => {
//     const provider: EthereumProvider = {
//         accounts: [],
//         chainId: '0x1', // 默认主网
//         // selectedAccount: null,
//         isBIUU: true,
//         isUnlocked: false,
//         selectedAccount:null,
//         isAAExtension:null,
//         // 请求处理
//         request: async (args: { method: string; params?: any[] }) => {
//             const { method, params } = args;
            
//             // 验证是否已解锁
//             if (!provider.isUnlocked && method !== 'eth_requestAccounts') {
//                 throw createProviderError(ProviderError.UNAUTHORIZED, 'Wallet is locked');
//             }

//             try {
//                 switch (method) {
//                     case 'eth_requestAccounts':
//                         return await requestAccounts();

//                     case 'eth_chainId':
//                         return provider.chainId;

//                     case 'eth_accounts':
//                         return provider.selectedAccount ? [provider.selectedAccount] : [];

//                     case 'eth_sign':
//                         return await signMessage(params);

//                     case 'eth_sendTransaction':
//                         // return await sendTransaction(params);

//                     case 'eth_signTransaction':
//                         // return await signTransaction(params);

//                     case 'eth_signTypedData':
//                     case 'eth_signTypedData_v3':
//                     case 'eth_signTypedData_v4':
//                         // return await signTypedData(params);

//                     case 'wallet_switchEthereumChain':
//                         // return await switchChain(params);

//                     case 'wallet_addEthereumChain':
//                         // return await addChain(params);

//                     default:
//                         throw createProviderError(ProviderError.UNSUPPORTED_METHOD, `Method not supported: ${method}`);
//                 }
//             } catch (error) {
//                 console.error('Request failed:', error);
//                 throw error;
//             }
//         },

//         // 事件监听
//         on: (eventName: string, listener: (...args: any[]) => void) => {
//             // 创建事件监听器
//             const eventListeners:any = {
//                 accountsChanged: new Set<(...args: any[]) => void>(),
//                 chainChanged: new Set<(...args: any[]) => void>(),
//                 disconnect: new Set<(...args: any[]) => void>(),
//                 message: new Set<(...args: any[]) => void>()
//             };
            
//             if (eventListeners[eventName]) {
//                 eventListeners[eventName].add(listener);
                
//                 // 创建消息监听器
//                 const messageListener = (event: MessageEvent) => {
//                     if (event.data.type === `eip1193:${eventName}`) {
//                         listener(event.data.detail);
//                     }
//                 };
                
//                 window.addEventListener('message', messageListener);
                
//                 return () => {
//                     eventListeners[eventName].delete(listener);
//                     window.removeEventListener('message', messageListener);
//                 };
//             }
//         },

//         // 移除事件监听
//         removeListener: (eventName: string, listener: (...args: any[]) => void) => {
//             const eventListeners = {
//                 accountsChanged: new Set<(...args: any[]) => void>(),
//                 chainChanged: new Set<(...args: any[]) => void>(),
//                 disconnect: new Set<(...args: any[]) => void>(),
//                 message: new Set<(...args: any[]) => void>()
//             };
            
//             // if (eventListeners[eventName]) {
//             //     eventListeners[eventName].delete(listener);
//             // }
//         },

//         // 断开连接
//         disconnect: () => {
//             provider.accounts = [];
//             provider.selectedAccount = null;
//             provider.chainId = '';
//             provider.isUnlocked = false;
//             window.dispatchEvent(new CustomEvent("eip1193:disconnect", {
//                 detail: { code: ProviderError.DISCONNECTED, message: 'User disconnected' }
//             }));
//         },

//         // 账户变化事件
//         accountsChanged: (accounts: string[]) => {
//             console.log('Accounts changed:', accounts);
//             provider.accounts = accounts;
//             if (accounts.length > 0) {
//                 provider.selectedAccount = accounts[0];
//             }
//             window.dispatchEvent(new CustomEvent("eip1193:accountsChanged", {
//                 detail: accounts
//             }));
//         },

//         // 链变化事件
//         chainChanged: (chainId: string) => {
//             console.log('Chain changed:', chainId);
//             provider.chainId = chainId;
//             window.dispatchEvent(new CustomEvent("eip1193:chainChanged", {
//                 detail: chainId
//             }));
//         },

//         // 扩展信息
//         providerInfo
//     };

//     return provider;
// };

// // 请求账户
// const requestAccounts = async (): Promise<string[]> => {
//     return new Promise((resolve, reject) => {
//         const popup = window.open(chrome.runtime.getURL('/popup/secret/index.html'), '_blank', 'width=400,height=600');
        
//         const listener = (event: MessageEvent) => {
//             if (event.source === popup) {
//                 window.removeEventListener('message', listener);
//                 if (event.data.type === 'accounts_response') {
//                     const accounts = event.data.accounts;
//                     // provider.accounts = accounts;
//                     // provider.selectedAccount = accounts[0];
//                     // provider.isUnlocked = true;
//                     resolve(accounts);
//                 } else {
//                     reject(createProviderError(ProviderError.USER_REJECTED_REQUEST, 'User rejected account request'));
//                 }
//             }
//         };
        
//         window.addEventListener('message', listener);
        
//         setTimeout(() => {
//             window.removeEventListener('message', listener);
//             reject(createProviderError(ProviderError.USER_REJECTED_REQUEST, 'Request timed out'));
//         }, 30000);
//     });
// };

// // 签名消息
// const signMessage = async (params: any): Promise<string> => {
//     const [address, message] = params;
    
//     // if (!provider.selectedAccount || provider.selectedAccount !== address) {
//     //     throw createProviderError(ProviderError.UNAUTHORIZED, 'Invalid account');
//     // }
    
//     return new Promise((resolve, reject) => {
//         const popup = window.open(chrome.runtime.getURL('/popup/sign.html'), '_blank', 'width=400,height=600');
        
//         const listener = (event: MessageEvent) => {
//             if (event.source === popup) {
//                 window.removeEventListener('message', listener);
//                 if (event.data.type === 'signature_response') {
//                     resolve(event.data.signature);
//                 } else {
//                     reject(createProviderError(ProviderError.USER_REJECTED_REQUEST, 'User rejected signature'));
//                 }
//             }
//         };
        
//         window.addEventListener('message', listener);
//     })
// }
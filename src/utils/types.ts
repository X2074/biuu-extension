export interface EthereumProvider {
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(eventName: string, listener: (...args: any[]) => void): void;
  removeListener(eventName: string, listener: (...args: any[]) => void): void;
  accountsChanged(eventName: string[], listener: (...args: any[]) => void): void;
  chainChanged(eventName: string, listener: (...args: any[]) => void): void;
  accounts: string[];
  chainId: string;
  isBIUU:boolean;
  isUnlocked:boolean;
  selectedAccount:any;
  isAAExtension:any;
  disconnect: () => void;
  providerInfo: {
      label: string;
      injectedNamespace: string;
      identityFlag: string;
      checkIdentity: (provider: EthereumProvider) => boolean;
  };
}

export type WalletProvider = {
  providerInfo?: {
    label: string;
    injectedNamespace: string;
    iconURL: string;
    identityFlag?: string;
    checkIdentity?: () => boolean;
  };
  on: (
    eventName: string | symbol,
    listener: (...args: unknown[]) => void
  ) => unknown;
  removeListener: (
    eventName: string | symbol,
    listener: (...args: unknown[]) => void
  ) => unknown;
  [optionalProps: string]: unknown;
};




export const AllowedQueryParamPage = {
signTransaction: '/secret',//交易签名请求
dappPermission: '/connect',//DApp 权限请求
signData: '/secret',//数据签名请求
  personalSignData: '/secret',//个人签名请求
  signMessage: '/sign',//消息签名请求
  addEthereumChain: '/addEthereumChain', //添加链请求

} as const;

export type AllowedQueryParamPageType =
(typeof AllowedQueryParamPage)[keyof typeof AllowedQueryParamPage];

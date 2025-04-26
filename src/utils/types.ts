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
dappPermission: '/secret',//DApp 权限请求
signData: '/secret',//数据签名请求
personalSignData: '/secret',//个人签名请求

} as const;

export type AllowedQueryParamPageType = (typeof AllowedQueryParamPage)[keyof typeof AllowedQueryParamPage];
  
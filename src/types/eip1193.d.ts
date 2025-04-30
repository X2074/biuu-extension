export interface EthereumProvider {
  chainId: string;
  accounts: string[];
  providerInfo: {
      label: string;
      injectedNamespace: string;
      identityFlag: string;
      checkIdentity: (provider: EthereumProvider) => boolean;
      name: string;
      version: string;
  };
}

export interface EthereumProviderEventMap {
  'accountsChanged': string[];
  'chainChanged': string;
  'disconnect': { code: number; message: string };
  'connect': { chainId: string };
}

export interface EthereumProviderRpcError extends Error {
  code: number;
  data?: any;
}
export interface EthereumProvider {
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(event: string, callback: (data: any) => void): void;
  removeListener(event: string, callback: (data: any) => void): void;
  chainId: string;
  accounts: string[];
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
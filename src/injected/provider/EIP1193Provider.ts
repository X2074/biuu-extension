import { EthereumProvider} from '@/types/eip1193';
declare global {
  interface WindowEventMap {
    "eip1193:requestAccounts": CustomEvent;
    "eip1193:accountsChanged": CustomEvent;
    "eip1193:chainChanged": CustomEvent;
    "eip1193:disconnect": CustomEvent;
  }
}

interface ProviderDetail {
  info: {
    uuid: string;
    name: string;
    icon: string;
    [key: string]: any;
  };
  provider: EthereumProvider;
}

let providers: ProviderDetail[] = [];
let currentProvider: EthereumProvider | null = null;

export const store = {
  value: () => ({
    providers,
    currentProvider
  }),
  subscribe: (callback: () => void) => {
    function onAccountsChanged(event: CustomEvent<string[]>) {
      if (currentProvider) {
        currentProvider.accounts = event.detail;
        callback();
      }
    }

    function onChainChanged(event: CustomEvent<string>) {
      if (currentProvider) {
        currentProvider.chainId = event.detail;
        callback();
      }
    }

    function onDisconnect(event: CustomEvent<{ code: number; message: string }>) {
      currentProvider = null;
      callback();
    }

    window.addEventListener("eip1193:accountsChanged", onAccountsChanged);
    window.addEventListener("eip1193:chainChanged", onChainChanged);
    window.addEventListener("eip1193:disconnect", onDisconnect);

    return () => {
      window.removeEventListener("eip1193:accountsChanged", onAccountsChanged);
      window.removeEventListener("eip1193:chainChanged", onChainChanged);
      window.removeEventListener("eip1193:disconnect", onDisconnect);
    };
  },
  connectProvider: async (uuid: string) => {
    const provider = providers.find(p => p.info.uuid === uuid);
    if (!provider) {
      throw new Error('Provider not found');
    }
    
    currentProvider = provider.provider;
    return currentProvider.request({ method: 'eth_requestAccounts' });
  },
  disconnect: () => {
    if (currentProvider) {
      window.dispatchEvent(new CustomEvent("eip1193:disconnect", {
        detail: { code: 1000, message: 'User disconnected' }
      }));
      currentProvider = null;
    }
  }
};
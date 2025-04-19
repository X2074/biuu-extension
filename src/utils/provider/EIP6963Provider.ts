// EIP6963Provider.ts

export interface EIP6963Provider {
    accounts: string[];
    chainId: string;
    isConnected: boolean;
    request: (request: { method: string; params?: any[] }) => Promise<any>;
    requestAccounts: () => Promise<string[]>;
    generateAccountAddress: () => string;
}

export class EIP6963ProviderImpl implements EIP6963Provider {
    accounts: string[] = [];
    chainId: string = '0x1'; // 主网的链 ID，您可以根据需要更改
    isConnected: boolean = false;

    async request({ method, params }: { method: string; params?: any[] }): Promise<any> {
        console.log('EIP6963ProviderImpl.request', method, params);
        switch (method) {
            case 'eth_requestAccounts':
                return this.requestAccounts();
            case 'eth_chainId':
                return this.chainId;
            // 添加其他需要支持的方法
            default:
                throw new Error(`Method ${method} not supported`);
        }
    }

    async requestAccounts(): Promise<string[]> {
        // 这里可以实现逻辑来获取用户账户
        if (!this.isConnected) {
            // 模拟连接
            this.accounts = [this.generateAccountAddress()];
            this.isConnected = true;
        }
        return this.accounts;
    }

    generateAccountAddress(): string {
        // 生成一个模拟的以太坊地址
        return '0x' + Math.random().toString(16).slice(2, 42);
    }
}

// 导出 EIP6963Provider 实例
// const provider = new EIP6963ProviderImpl();
// window.ethereum = provider; // 将 provider 赋值给 window.ethereum 以便被识别
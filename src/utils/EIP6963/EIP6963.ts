// EIP6963.ts
// 导入 EIP1193 相关的组件
import { eip1193Provider } from '../provider/EIP1193Provider';
// 定义事件名称类型
type EIP6963EventName = 'eip6963:announceProvider' | 'eip6963:requestProvider';

// 定义钱包信息接口
interface EIP6963ProviderInfo {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
}

// 定义 provider detail 接口
interface ProviderDetail {
    info: EIP6963ProviderInfo;
    provider: typeof eip1193Provider; // 使用 EIP1193 provider 类型
}

// 定义事件名称常量
export const EIP6963EventNames: Record<'Announce' | 'Request', EIP6963EventName> = {
    Announce: 'eip6963:announceProvider',
    Request: 'eip6963:requestProvider'
};

// 定义钱包信息常量
export const EIP6963ProviderInfo: EIP6963ProviderInfo = {
    uuid: "350670db-19fa-4704-a166-e52e178b59d2",
    name: "BIUU Wallet",
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
    rdns: "com.example.wallet"
};

// 定义 provider detail
export const providerDetail: ProviderDetail = {
    info: EIP6963ProviderInfo,
    provider: eip1193Provider
};
// 添加 provider 状态枚举
enum ProviderStatus {
    UNINITIALIZED,
    INITIALIZING,
    READY,
    ERROR,
    RECONNECTING
}

// 添加 provider 状态（在文件顶部）
let providerStatus: ProviderStatus = ProviderStatus.UNINITIALIZED;

// 添加重试计数器
let retryCount = 0;
const MAX_RETRIES = 3;

// 宣布提供商函数
export function announceProviderInject() {
    console.log(providerDetail, 'providerDetail');
    // 验证 provider detail
    if (!providerDetail?.info || !providerDetail?.provider) {
        console.error('Invalid provider detail');
        return;
    }

    // 检查是否已经注入
    if (window.ethereum && window.ethereum.isBiuu) {
        console.log('Biuu provider already injected');
        return;
    }
    // 错误处理
    const handleError = (error: ErrorEvent) => {
        console.error('Provider error:', error);
        providerStatus = ProviderStatus.ERROR;
        retryProvider();
    };
    // 添加清理函数
    const cleanup = () => {
        window.removeEventListener('eip6963:requestProvider', handleProviderRequest);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('error', handleError);
    };

    // 处理卸载
    const handleBeforeUnload = () => {
        cleanup();
        providerStatus = ProviderStatus.UNINITIALIZED;
    };
    function announceProvider() {
        window.dispatchEvent(
            new CustomEvent("eip6963:announceProvider", {
                detail: Object.freeze(providerDetail),
                bubbles: true,
                cancelable: true
            })
        );
    }

    // 重试机制
    const retryProvider = () => {
        if (retryCount >= MAX_RETRIES) {
            console.error('Max retries reached');
            providerStatus = ProviderStatus.ERROR;
            return;
        }

        retryCount++;
        providerStatus = ProviderStatus.RECONNECTING;
        setTimeout(() => {
            handleProviderRequest(new Event('eip6963:requestProvider'));
        }, 1000 * retryCount);
    };

    // 使用 async/await 处理异步请求
    const handleProviderRequest = async (event: Event) => {
        console.log(event, 'handleProviderRequest')
        try {
            if (providerStatus !== ProviderStatus.UNINITIALIZED) {
                console.log('Provider is busy');
                return;
            }

            // 设置状态为 READY
            providerStatus = ProviderStatus.READY;
            retryCount = 0;

            // 注入 provider
            window.ethereum = providerDetail.provider;
            window.ethereum.isBiuu = true;

            // 添加事件监听
            setupProviderListeners();

            // 宣布 provider
            announceProvider();
        } catch (error: any) {
            console.error('Connection failed:', error);
            // // 发送断开连接事件
            // window.dispatchEvent(new CustomEvent("eip1193:disconnect", {
            //     detail: { code: 1000, message: error.message }
            // }));
            providerStatus = ProviderStatus.ERROR;
            retryProvider();
        }
    };
    // 设置 provider 监听器
    const setupProviderListeners = () => {
        if (!providerDetail.provider) return;

        // 监听账户变化
        providerDetail.provider.on('accountsChanged', (accounts: string[]) => {
            console.log('Accounts changed:', accounts);
            window.dispatchEvent(new CustomEvent("eip1193:accountsChanged", {
                detail: accounts
            }));
        });

        // 监听网络变化
        providerDetail.provider.on('chainChanged', (chainId: string) => {
            console.log('Chain changed:', chainId);
            window.dispatchEvent(new CustomEvent("eip1193:chainChanged", {
                detail: chainId
            }));
        });

        // 错误处理
        providerDetail.provider.on('error', (error: any) => {
            console.error('Provider error:', error);
            providerStatus = ProviderStatus.ERROR;
            retryProvider();
        });
    };
    // 添加事件监听器
    window.addEventListener("eip6963:requestProvider", handleProviderRequest);
    window.addEventListener('eip6963:requestProvider', handleProviderRequest);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('error', handleError);

    // 尝试初始化
    handleProviderRequest(new Event('eip6963:requestProvider'));
}
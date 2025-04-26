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

// 宣布提供商函数
export function announceProviderInject() {
console.log(providerDetail,'providerDetail');

    function announceProvider() {
        window.dispatchEvent(
            new CustomEvent("eip6963:announceProvider", {
                detail: Object.freeze(providerDetail),
            })
        );
    }

    // 使用 async/await 处理异步请求
    const handleProviderRequest = async (event: Event) => {
        console.log('EIP6963 request received:', event);
        
        try {
            // 使用 EIP1193 provider 连接
            const accounts = await providerDetail.provider.request({ 
                method: 'eth_requestAccounts',
                params: []
            });
            console.log('Connected with accounts:', accounts);
            
            // 发送账户变化事件
            window.dispatchEvent(new CustomEvent("eip1193:accountsChanged", {
                detail: accounts
            }));
            
            // 发送链变化事件
            window.dispatchEvent(new CustomEvent("eip1193:chainChanged", {
                detail: providerDetail.provider.chainId
            }));
            
            // 重新宣布
            announceProvider();
        } catch (error:any) {
            console.error('Connection failed:', error);
            // 发送断开连接事件
            window.dispatchEvent(new CustomEvent("eip1193:disconnect", {
                detail: { code: 1000, message: error.message }
            }));
        }
    };
    // 添加事件监听器
    window.addEventListener("eip6963:requestProvider", handleProviderRequest);

    announceProvider();
}

// 验证 provider detail 函数
export function isValidProviderDetail(providerDetail: ProviderDetail): boolean {
    console.log('announceProvider', providerDetail);
    return true;
}

// 抛出错误函数
export function throwErrorEIP6963(message: string): never {
    throw new Error(
        `${message} See https://eips.ethereum.org/EIPS/eip-6963 for requirements.`
    );
}
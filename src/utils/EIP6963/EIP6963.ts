// EIP6963.ts

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
    provider: any; // 可以根据实际需求进一步定义 provider 的类型
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
    provider: null
};

// 宣布提供商函数
export function announceProviderInject() {
    function announceProvider() {
        window.dispatchEvent(
            new CustomEvent("eip6963:announceProvider", {
                detail: Object.freeze(providerDetail),
            })
        );
    }

    window.addEventListener(
        "eip6963:requestProvider",
        (event) => {
            console.log(event);
            
            announceProvider();
        }
    );

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
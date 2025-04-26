// EIP6963.js
// 描述可能的 EIP-6963 事件名称
const EIP6963EventNames = {
    Announce: 'eip6963:announceProvider',
    Request: 'eip6963:requestProvider'
};

// 钱包信息类型定义
const EIP6963ProviderInfo = {
    uuid: "350670db-19fa-4704-a166-e52e178b59d2",
    name: "Example Wallet",
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
    rdns: "com.example.wallet"
};

// 定义 provider detail
const providerDetail = { 
    info: EIP6963ProviderInfo,
    provider: null
};

// 宣布提供商
function announceProvider(providerDetail) {
    console.log('announceProvider', providerDetail);
    
    window.dispatchEvent(
        new CustomEvent(EIP6963EventNames.Announce, {
            detail: Object.freeze(providerDetail)
        })
    );
}

// 验证 provider detail
function isValidProviderDetail(providerDetail) {
    return true;
}

// 抛出错误
function throwErrorEIP6963(message) {
    throw new Error(
        `${message} See https://eips.ethereum.org/EIPS/eip-6963 for requirements.`
    );
}

// 导出函数
export function announceProviderInject() {
    // window.addEventListener(
    //     EIP6963EventNames.Request,
    //     (event) => {
    //         announceProvider(providerDetail);
    //     }
    // );
    // announceProvider(providerDetail);
    let provider;
    function announceProvider() {
        const info = {
            uuid: "350670db-19fa-4704-a166-e52e178b59d2",
            name: "Example 0000 Wallet",
            icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
            rdns: "com.example.wallet"
        };
        window.dispatchEvent(
            new CustomEvent("eip6963:announceProvider", {
                detail: Object.freeze({ info, provider }),
            })
        );
    }

    window.addEventListener(
        "eip6963:requestProvider",
        (event) => {
            announceProvider();
        }
    );

    // indexInjected.ts
window.addEventListener('message', (event) => {
    // 验证消息来源
    console.log(event,"注入脚本数据");
    
});

    announceProvider();
}
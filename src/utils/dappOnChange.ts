export async function chainChanged (chainId: string){
    let data:any = { name: 'biuu-external' }
    // 创建到后台的端口连接
    const port = chrome.runtime.connect(data);
    // 发送 chainChanged 事件到 DApp
    port.postMessage({
        action: 'send_to_dapp',
        data: {
            type: 'chainChanged',  
            target: 'biuu-window-provider',  
            chainId: `0x${Number(chainId).toString(16)}`
        }
    });
}

export async function accountsChanged (account: string){
    let data:any = { name: 'biuu-external' }
    // 创建到后台的端口连接
    const port = chrome.runtime.connect(data);
    // 发送 chainChanged 事件到 DApp
    port.postMessage({
        action: 'send_to_dapp',
        data: {
            type: 'accountsChanged',  
            target: 'biuu-window-provider',  
            accounts: [account]
        }
    });
}
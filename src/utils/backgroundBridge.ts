// src/utils/backgroundBridge.ts
export const getChainIdFromBackground = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        // 发送请求到 content script
        window.postMessage(
            {
                target: 'biuu-provider-bridge',
                request: {
                    method: 'account_chainId',
                    params:[]
                }
            },
            '*'
        );

        // 监听响应
        const listener = (event: MessageEvent) => {
            if (event.data.target === 'biuu-window-provider') {
                window.removeEventListener('message', listener);
                if (event.data.type === "account_chainId" && event.data.accounts) {
                    console.log(event.data,"event.dataevent.dataevent.dataevent.data");
                    
                    resolve(event.data.accounts);
                } else {
                    reject(event.data.error || new Error('Request failed'));
                }
            }
        };
        window.addEventListener('message', listener);
    });
};
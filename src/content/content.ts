// 在 content script 中使用
// 存储端口连接
let providerPort: chrome.runtime.Port | null = null;
// 创建新的端口连接
function createProviderPort() {
    let data: any = { name: 'biuu-external' };
    providerPort = chrome.runtime.connect(data);
    console.log('Port created:', providerPort);
    try {
        // 设置消息监听器
        providerPort.onMessage.addListener((data) => {
            console.log(data,877);
            
            // 将响应返回给 DApp-background
            window.postMessage(
                {
                    ...data,
                    target: 'biuu-window-provider'
                },
                window.location.origin
            );
        });
        // 处理端口断开
        providerPort.onDisconnect.addListener(() => {
            console.log('Provider port disconnected');
            providerPort = null;
            // 尝试重新连接
          /*   setTimeout(() => {
                try {
                    createProviderPort();
                } catch (error) {
                    console.error('Failed to reconnect:', error);
                }
            }, 1000); */
        });
    } catch (error) {
        console.error('Failed to create port:', error);
        // 尝试重新连接
      /*   setTimeout(() => {
            try {
                createProviderPort();
            } catch (error) {
                console.error('Failed to reconnect:', error);
            }
        }, 1000); */
    }
}

chrome.runtime.onConnect.addListener((port) => {
    console.log('我听到了全局的消息' + port);
});
const windowOriginAtLoadTime = window.location.origin;
// 监听 DApp 消息
window.addEventListener(
    'message',
    function (e: any) {
        // 将通信信息暴露给background页面，将消息过滤，获取属于自己的消息数据
        if (e.data == 'page') {
            chrome.runtime.sendMessage(
                { action: 'test', test: 'content传递数据给service-worker' },
                {},
                (response: any) => {
                    console.log(response);
                    if (response?.action === 'service') {
                        console.log('content接收到service-worker的数据');
                        window.postMessage({ test: '我是主窗口，我接收到消息了' });
                    }
                }
            );
        }

        // 验证消息来源
        if (!e.data) return; //没有request说明没有要求
        if (e.origin !== window.location.origin) return;
        if (e.source !== window) return;
        if (!e.data?.target) return;
        // 收集 DApp 页面的标识信息（favicon 和标题），以便在钱包弹窗中显示，是否每次获取存疑？？？。？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？
        if (e.data.request && e.data.request.method == 'eth_requestAccounts') {
            const faviconElements: NodeListOf<HTMLLinkElement> = window.document.querySelectorAll("link[rel*='icon']");
            const largestFavicon = [...faviconElements].sort((el) =>
                parseInt(el.sizes?.toString().split('x')[0], 10)
            )[0];
            const faviconUrl = largestFavicon?.href ?? '';
            const origin = window.location.origin;
            const { title } = window.document ?? '';
            // 确保 request 和 params 都是数组
            if (!e.data.request) {
                e.data.request = { windowInfo: [] };
            } else if (!e.data.request.windowInfo) {
                e.data.request.windowInfo = [];
            }
            e.data.request.windowInfo.push(title, faviconUrl, origin);
            console.log(e.data, 'e.datae.data');
        }

        if (e.data.target === 'biuu-provider-bridge') {
            // 如果没有连接，创建新的连接
            if (!providerPort) {
                createProviderPort();
            }

            // 发送消息到 background
            if (providerPort) {
                providerPort.postMessage(e.data);
            }
        }
    },
    true
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse: any) => {
    console.log(message, sender, 'content页面');
    if (message.action === 'service') {
        console.log('content接收到service-worker的数据');
        window.postMessage({ test: '我是主窗口，我接收到消息了' });
        // 调用 sendResponse 并返回 true 表示异步处理
        sendResponse({ response: 'content script 已处理消息' });
        return true; // 返回 true 表示需要异步处理
    } else if (message.action === 'send_to_dapp') {
        window.postMessage(
            {
                ...message.data,
                target: 'biuu-window-provider'
            },
            window.location.origin
        );
    }
});
// 初始化
    console.log('dom未完全加载');
    // 使用标志位防止重复注入
    let isInjected = false;
// connectProviderBridge();

// 在脚本开始处立即注入 provider
function injectProvider() {
    console.log(window.ethereum,"window.ethereum");
    
     // 检查是否已经注入过
     if (isInjected || (window.ethereum && window.ethereum.isBiuu)) {
        console.log('Provider already injected or already exists');
        return;
    }
    console.log("是否注入了");
    isInjected = true;
    // 创建注入脚本
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected/indexInjected.js');
    script.onload = function() {
        // 注入完成后移除脚本标签
        if (script.parentNode) {
            script.parentNode.removeChild(script);
        }
    };
    (document.head || document.documentElement).appendChild(script);
}


// 立即尝试注入（适用于页面加载前）
if (document.readyState === 'loading') {
    // 如果文档还在加载，添加 DOMContentLoaded 监听
    document.addEventListener('DOMContentLoaded', injectProvider);
} else {
    // 如果文档已经加载完成，直接注入
    injectProvider();
}

// 同时监听页面可见性变化，处理SPA路由切换
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !window.ethereum?.isBiuu) {
        injectProvider();
    }
});
import { EXTERNAL_PORT_NAME, PROVIDER_BRIDGE_TARGET,WINDOW_PROVIDER_TARGET,AA_EXTENSION_CONFIG } from './constants';
// 负责在 DApp 页面和扩展的 Background Script 之间建立通信桥梁
export function connectProviderBridge(): void {
    // 建立与 Background Script 的连接
    const port = chrome.runtime.connect(EXTERNAL_PORT_NAME);
    console.log(port,"portportportport");
    
    const windowOriginAtLoadTime = window.location.origin;
    window.addEventListener('message', (event) => {
        /* 检查消息是否来自页面脚本
            1、确保消息来自页面脚本
            2、确保消息是安全的（例如，不是来自恶意页面）
            3、确保消息是期望的（例如，不是来自其他页面）
            */
        if (
            event.origin === windowOriginAtLoadTime && // 我们只接收来自页面脚本的消息
            event.source === window &&
            event.data.target === PROVIDER_BRIDGE_TARGET
        ) {
            // 如果 dapp 想要连接，我们就获取它的详细信息
            if (event.data.request.method === 'eth_requestAccounts' || event.data.request.method === 'eth_accounts') {
                // 收集 DApp 页面的标识信息（favicon 和标题），以便在钱包弹窗中显示。
                const faviconElements: NodeListOf<HTMLLinkElement> = window.document.querySelectorAll("link[rel*='icon']");
                const largestFavicon = [...faviconElements].sort((el) => parseInt(el.sizes?.toString().split('x')[0], 10))[0];
                const faviconUrl = largestFavicon?.href ?? '';
                const { title } = window.document ?? '';
                // 确保 params 是数组
                if (!event.data.request.params) {
                    event.data.request.params = [];
                }
                event.data.request.params.push(title, faviconUrl);
            }

            console.log(
                `%c content: inpage >>> background: ${JSON.stringify(event.data)}`,
                'background: #bada55; color: #222'
            );

            port.postMessage(event.data);
        }
    });
    // 监听 background 的响应
    port.onMessage.addListener((data) => {
        console.log(`%c content: background >>> inpage: ${JSON.stringify(data)}`, 'background: #222; color: #bada55');
        window.postMessage(
            {
                ...data,
                target: WINDOW_PROVIDER_TARGET
            },
            windowOriginAtLoadTime
        );
    });

    // 处理端口断开
    port.onDisconnect.addListener(() => {
        console.log('Provider port disconnected');
        // 可以在这里重新创建连接
    });
}

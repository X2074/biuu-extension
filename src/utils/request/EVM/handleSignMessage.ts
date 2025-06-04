
import { showExtensionPopup } from '../../index.ts';
// 添加处理签名请求的函数
export default async function handleSignMessage(request: any) {
    try {
        const [message, address] = request.params || [];

        // 获取当前活动标签页
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.url) {
            throw new Error('Unable to determine the current tab URL');
        }

        const currentOrigin = new URL(tab.url).origin;
        // 创建签名弹窗
        let url: any = `/sign?message=${encodeURIComponent(message)}&address=${address}&origin=${encodeURIComponent(
            currentOrigin
        )}`;
        let popupUrl: any = await showExtensionPopup(url);
        // 返回一个 Promise，等待用户响应
        return new Promise((resolve, reject) => {
            const handleMessage: any = (message: any) => {
                console.log(message, 'messagehandleMessage');

                if (message.action === 'personal_sign') {
                    chrome.runtime.onMessage.removeListener(handleMessage);

                    if (message.signature) {
                        resolve(message.signature);
                    } else {
                        reject(new Error(message.error || 'User rejected the request'));
                    }
                }
            };

            chrome.runtime.onMessage.addListener(handleMessage);

            // 设置超时
            setTimeout(() => {
                chrome.runtime.onMessage.removeListener(handleMessage);
                reject(new Error('Sign request timeout'));
            }, 300000); // 5分钟超时
        });
    } catch (error) {}
}

import indexDbData from '../indexDB';
export async function requestPermissions(message: any) {
    console.log('requestPermissions',message);
    
    
    // 处理权限请求
    const permissions = message.permissions;

    // 创建授权弹窗
    const popup:any = await chrome.windows.create({
        url: chrome.runtime.getURL('popup/index.html#/connect'),
        type: 'popup',
        width: 400,
        height: 300
    });

    // // 将请求信息传递给弹窗
    // await chrome.tabs.sendMessage(popup.tabs[0].id, {
    //     action: 'set_permissions_request',
    //     permissions: permissions
    // });

    // 等待用户响应
    return new Promise((resolve, reject) => {
        const listener:any = async (request:any, sender:any, sendResponse:any) => {
            if (request.action === 'authorization_response') {
                if (request.approved) {
                    // 保存权限信息
                    const authorizedSites = await indexDbData.getData('authorized_sites') || {};
                    const currentUrl = new URL(window.location.href).origin;
                    authorizedSites[currentUrl] = true;
                    await indexDbData.putData({
                        id: 'authorized_sites',
                        content: authorizedSites
                    });

                    // 返回授权成功的响应
                    resolve({
                        jsonrpc: '2.0',
                        id: 1,
                        result: [{
                            id: '0x1',
                            has: true,
                            permissions: permissions
                        }]
                    });
                } else {
                    reject(new Error('User rejected the authorization request'));
                }

                // 移除监听器
                chrome.runtime.onMessage.removeListener(listener);

                // 关闭弹窗
                chrome.windows.remove(popup.id);
            }
            return true;
        };

        chrome.runtime.onMessage.addListener(listener);
    });
}
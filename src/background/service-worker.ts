chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getSecret') {
        chrome.storage.local.get('secret', function (data) {
            sendResponse(data);
        });
        return true; // 保持消息通道打开，以便异步发送响应
    }
})
console.log(chrome, 'chrome.runtime');
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getSecret') {
        chrome.storage.local.get('secret', function (data) {
            sendResponse(data);
        });
        return true; // 保持消息通道打开，以便异步发送响应
    }
    if (message.action === 'setSecret') {
        chrome.storage.local.set({ 'secret': message.data });
    }
})

// 在此处执行浏览器关闭时的操作
chrome.windows.onRemoved.addListener(function () {
    console.log('浏览器即将关闭！');
    chrome.storage.local.remove('secret');
});
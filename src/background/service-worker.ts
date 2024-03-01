chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message, 'message');

    if (message.action === 'getSecret') {
        chrome.storage.local.get('secret', function (data) {
            console.log(data, 'datadatadata');
            sendResponse(data);
        });
        return true; // 保持消息通道打开，以便异步发送响应
    }
    if (message.action === 'setSecret') {
        chrome.storage.local.set({ 'secret': message.text });
    }
    if (message.action === 'test') {
        console.log("service-worker接收到content的数据");
        let aaa = { action: 'service', test: 'service-worker传递数据给content' }
        sendResponse(aaa);
        return true; // 保持消息通道打开，以便异步发送响应
    }
})

// 在此处执行浏览器关闭时的操作
chrome.windows.onRemoved.addListener(function () {
    console.log('浏览器即将关闭！');
    chrome.storage.local.remove('secret');
});
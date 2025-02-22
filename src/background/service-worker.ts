import { startHeartbeat } from './resident.js';
// import { roundRobin } from './indexDB.js';""
import web3Operate from './web3Operate.js';
import { chromeNotifications } from './utils';
import './utils';
import './test';

// 开始轮循hash状态
// roundRobin()
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message, '测试数据00002');
    setTimeout(() => {
        // chromeNotifications({})
    }, 3000)
    // 获取密码，判断是否显示输入密码页面
    if (message.action === 'getSecret') {
        chrome.storage.local.get('secret', function (data) {
            console.log(data, 'datadatadata');
            sendResponse(data);
        });
        return true; // 保持消息通道打开，以便异步发送响应
    }
    // 设置密码缓存
    if (message.action === 'setSecret') {
        chrome.storage.local.set({ 'secret': message.text });
    }

    // 交易转账
    if (message.action === 'transferEVM') {
        sendResponse();
        startHeartbeat();//js常驻后台
        console.log(web3Operate, 'web3Operate');
        web3Operate.evmTransfer(message)
    }
    if (message.action === 'transferUTXO') {
        sendResponse();
        startHeartbeat();//js常驻后台
        if (!message['type']) {
            console.log(web3Operate, 'web3Operate');
            web3Operate.utxoTransfer(message)
        }
        if (message['type'] && message['type'] == 'transfer') {
            console.log(web3Operate, 'web3Operate');
            web3Operate.transferUtxo(message)
        }
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
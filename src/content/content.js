window.addEventListener('message', function (e) {
  console.log(e, "eeeeeee");

  // 将通信信息暴露给background页面，将消息过滤，获取属于自己的消息数据
  if (e.data == 'page') {
    chrome.runtime.sendMessage({ action: 'test', test: "content传递数据给service-worker" }, (response) => {
      if (response.action === 'service') {
        console.log("content接收到service-worker的数据");
        window.postMessage({ test: "我是主窗口，我接收到消息了" });
      }
    });
  }
}, true);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'service') {
    console.log("content接收到service-worker的数据");
    window.postMessage({ test: "我是主窗口，我接收到消息了" });
  }
})

// 页面加载时注入我们的内容脚本
const script = document.createElement('script')
script.src = chrome.runtime.getURL('injected/injected.js')
  ; (document.head || document.documentElement).appendChild(script)


  
// 页面加载时注入我们的内容脚本
// script.src = chrome.runtime.getURL('injected/EIP6963.ts')
//   ; (document.head || document.documentElement).appendChild(script)

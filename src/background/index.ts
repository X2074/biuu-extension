// import { handleProviderRequest } from './provider';

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request, "requestrequestrequest");

  if (!request.method) {
    // sendResponse({ error: { message: 'Method is required' } });
    return true;
  }

  // handleProviderRequest(request)
  //   .then((result: any) => {
  //     sendResponse({ result });
  //   })
  //   .catch((error: any) => {
  //     sendResponse({ error: { message: error.message } });
  //   });

  return true; // 表示我们会异步发送响应
});

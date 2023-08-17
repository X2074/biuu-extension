// 重要，处理background只能加载一个html的问题
console.log('我是背景页啊')
// chrome.tabs.query({ url: 'background.html' }, function(tabs) {
//     console.log(tabs, '我是背景页啊')
//   if (tabs && tabs.length > 0) {
//     // 如果标签页已经存在，则激活该标签页
//     // chrome.tabs.update(tabs[0].id, { active: true });
//   } else {
//     // 如果标签页不存在，则打开一个新的标签页
//     // chrome.tabs.create({ url: 'background.html' });
//   }
// });
chrome.runtime.onMessage.addListener() 

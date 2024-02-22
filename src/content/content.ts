console.log('this is content file --')

const init = () => {
  const addIframe = (id: string, pagePath: string) => {
    const contentIframe = document.createElement("iframe");
    contentIframe.id = id;
    contentIframe.style.cssText = "width: 100%; height: 100%; position: fixed; inset: 0px; margin: 0px auto; z-index: 10000002; border: none;";
    const getContentPage = chrome.runtime.getURL(pagePath);
    contentIframe.src = getContentPage;
    document.body.appendChild(contentIframe);
  }

  addIframe('content-start-iframe', 'contentPage/index.html')
}

// 判断 window.top 和 self 是否相等，如果不相等，则不注入 iframe
if (window.top === window.self) {
  init();
}
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log("Message received from content script:", message);
});
export const sendMessageToTab = (tabId, data) =>
  chrome.tabs.sendMessage(tabId, data);

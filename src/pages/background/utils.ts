export const sendMessageToTab = (tabId, data) =>
  chrome.tabs.sendMessage(tabId, data);

export const extractMessageString = (conversation) => {
  return Object.values(conversation.mapping)
    .map((item: any) => {
      return item.message?.content?.parts?.join(" ") || "";
    })
    .join(" ");
};

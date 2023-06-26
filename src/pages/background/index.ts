import { fetchAllConversations, fetch_session } from "@src/api";
import { MESSAGE_ACTIONS } from "@src/constants";
import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate("pages/content/style.scss");

console.log("background loaded 0");

function saveConversationList(conversationList) {
  chrome.storage.local.set({ conversationList });
}

function saveConversationDetail(conversationId, conversationDetail) {
  chrome.storage.local.set({ [conversationId]: conversationDetail });
}

function getConversationList() {
  return chrome.storage.local.get(["conversationList"]);
}

function getConversationDetail(conversationId) {
  return chrome.storage.local.get([conversationId]);
}

function saveSession(session) {
  chrome.storage.local.set({ session });
}

function getSession() {
  return chrome.storage.local.get(["session"]);
}

async function fetchSessionAndConversationList() {
  const session = await fetch_session();

  if (!session.accessToken) return null;
  saveSession(session);

  const conversationList = await fetchAllConversations(session.accessToken);
  saveConversationList(conversationList);

  return { session, conversationList };
}

async function handleStartFetchingConversations(tabId) {
  console.log("start fetching conversations", tabId);
  let data = await getConversationList();
  console.log("get conversation list from storage", data);

  if (!data.conversationList) {
    data = await fetchSessionAndConversationList();
  }

  if (!data) {
    chrome.tabs.sendMessage(tabId, {
      type: MESSAGE_ACTIONS.FINISH_FETCHING_CONVERSATIONS,
      data: [],
    });
  }
  chrome.tabs.sendMessage(tabId, {
    type: MESSAGE_ACTIONS.FINISH_FETCHING_CONVERSATIONS,
    data: data.conversationList,
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("background received message ", {
    type: request.type,
    tabId: sender.tab.id,
  });
  switch (request.type) {
    case MESSAGE_ACTIONS.START_FETCHING_CONVERSATIONS:
      console.log("start fetching session and conversations");
      handleStartFetchingConversations(sender.tab.id);
      break;
  }
});

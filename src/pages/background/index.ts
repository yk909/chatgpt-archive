import {
  fetchAllConversations,
  fetchAllConversationsWithDetail,
  fetch_session,
} from "@src/api";
import { MESSAGE_ACTIONS } from "@src/constants";
import { initDB, db } from "@src/db";
import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate("pages/content/style.scss");

console.log("background loaded 0");

function saveConversationList(conversationList) {
  // chrome.storage.local.set({ conversationList });
  db.conversations.bulkPut(conversationList).then(() => {
    console.log("saved conversation list to dexie");
  });
}

function saveConversationDetail(conversationId, conversationDetail) {
  chrome.storage.local.set({ [conversationId]: conversationDetail });
}

function getConversationList() {
  // return chrome.storage.local.get(["conversationList"]);
  return db?.conversations.toArray();
}

function getConversationDetail(conversationId) {
  return chrome.storage.local.get([conversationId]);
}

function saveSession(session) {
  chrome.storage.local.set({ session });
}

let session;

async function getSession() {
  // let session = await chrome.storage.local.get(["session"]);
  // if (session) return session;
  session = await fetch_session();
  if (!session.accessToken) return null;
  saveSession(session);
  return session;
}

async function fetchSessionAndConversationList() {
  const session = await fetch_session();

  if (!session.accessToken) return null;
  saveSession(session);
  initDB(session.user.id);

  const conversationList = await fetchAllConversations(session.accessToken);
  await saveConversationList(conversationList);

  return { session, conversationList };
}

async function handleStartFetchingConversations(tabId) {
  const session = await getSession();
  if (!session) {
    return null;
  }
  console.log("session", session);
  initDB(session.user.id);

  console.log("start fetching conversations", tabId);
  let data = await db.conversations.orderBy("update_time").reverse().toArray();
  console.log("get conversation list from storage", data);

  if (!data || data.length === 0) {
    data = await fetchAllConversations(session.accessToken);
    await saveConversationList(data);
  }

  chrome.tabs.sendMessage(tabId, {
    type: MESSAGE_ACTIONS.FINISH_FETCHING_CONVERSATIONS,
    data,
  });
}

async function handleStartFetchingAllConversationDetails(tabId) {
  const session = await getSession();
  if (!session) {
    return null;
  }
  const con_list = await db.conversations
    .orderBy("update_time")
    .reverse()
    .toArray();
  let i = 0;
  function handleUpdateProgress() {
    i = i + 1;
    chrome.tabs.sendMessage(tabId, {
      type: MESSAGE_ACTIONS.UPDATE_FETCHING_CONVERSATION_DETAIL,
      progress: i,
      total: con_list.length,
    });
  }
  const conversationDetail = await fetchAllConversationsWithDetail(
    con_list,
    session.accessToken,
    handleUpdateProgress
  );
  chrome.tabs.sendMessage(tabId, {
    type: MESSAGE_ACTIONS.FINISH_FETCHING_CONVERSATION_DETAIL,
    data: conversationDetail,
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
    case MESSAGE_ACTIONS.FETCH_FILTERED_CONVERSATIONS:
      const { title } = request.data;
      console.log("fetch filtered conversations", request.data);
      db.conversations
        .orderBy("update_time")
        .reverse()
        .filter((c) => {
          const regex = new RegExp(title, "i");
          return regex.test(c.title);
        })
        .toArray()
        .then((data) => {
          console.log("res data", data);
          chrome.tabs.sendMessage(sender.tab.id, {
            type: MESSAGE_ACTIONS.FINISH_SEARCHING_CONVERSATIONS,
            data: data,
          });
        });
      break;
    case MESSAGE_ACTIONS.START_FETCHING_CONVERSATION_DETAIL:
      console.log("start fetching conversation detail");
      handleStartFetchingAllConversationDetails(sender.tab.id);
  }
});

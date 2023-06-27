import {
  fetchAllConversations,
  fetchAllConversationsWithDetail,
  fetch_conversation_detail,
  fetch_session,
} from "@src/api";
import { MESSAGE_ACTIONS } from "@src/constants";
import { initDB, db } from "@src/db";
import { FetchFilteredConversationData } from "@src/types";
import { batchPromises } from "@src/utils";
import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate("pages/content/style.scss");

console.log("background loaded 1");

function saveConversationList(conversationList) {
  // chrome.storage.local.set({ conversationList });
  db.conversations.bulkPut(conversationList).then(() => {
    console.log("saved conversation list to dexie");
  });
}

function saveConversationDetail(conversationId, conversationDetail) {
  // chrome.storage.local.set({ [conversationId]: conversationDetail });
  db.conversations
    .update(conversationId, {
      detail: conversationDetail,
    })
    .then(() => {
      console.log("saved conversation " + conversationId + " to dexie");
    });
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

async function handleStartFetchingConversations(tabId, force = false) {
  const session = await getSession();
  if (!session) {
    return null;
  }
  console.log("session", session);
  initDB(session.user.id);

  console.log("start fetching conversations", tabId);
  let data;
  if (!force) {
    data = await db.conversations.orderBy("update_time").reverse().toArray();
    console.log("get conversation list from storage", data);
    if (!data || data.length === 0) {
      data = await fetchAllConversations(session.accessToken);
      await saveConversationList(data);
    }
  } else {
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
    .limit(15)
    .toArray();
  let i = 0;
  function handleUpdateProgress() {
    i = i + 1;
    console.log("update progress", i);
    // chrome.tabs.sendMessage(tabId, {
    //   type: MESSAGE_ACTIONS.UPDATE_FETCHING_CONVERSATION_DETAIL,
    //   progress: i,
    //   total: con_list.length,
    // });
  }
  console.log("start fetching all conversation details");

  const promises = con_list.map((c) => {
    return async () => {
      handleUpdateProgress();
      const d = await fetch_conversation_detail(c.id, session.accessToken);
      console.log("fetched conversation detail", d);
      saveConversationDetail(c.id, d);
      return d;
    };
  });
  const conversationDetailList = await batchPromises(promises);

  // const conversationDetail = await fetchAllConversationsWithDetail(
  //   con_list,
  //   session.accessToken,
  //   handleUpdateProgress
  // );
  chrome.tabs.sendMessage(tabId, {
    type: MESSAGE_ACTIONS.FINISH_FETCHING_CONVERSATION_DETAIL,
    data: conversationDetailList,
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("background received message ", {
    type: request.type,
  });
  switch (request.type) {
    case MESSAGE_ACTIONS.INIT: {
      console.log("Initializing");
      console.log("Start swtich");
      handleStartFetchingConversations(sender.tab.id);
      break;
    }
    case MESSAGE_ACTIONS.FETCH_FILTERED_CONVERSATIONS: {
      const reqData: FetchFilteredConversationData = request.data;
      const { title } = reqData;
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
          data = data.map((d) => {
            return {
              ...d,
              title: d.title.replace(
                new RegExp(title, "i"),
                `<mark class="chatgpt-archive-highlight">${title}</mark>`
              ),
            };
          });
          console.log("res data", data);
          chrome.tabs.sendMessage(sender.tab.id, {
            type: MESSAGE_ACTIONS.FINISH_SEARCHING_CONVERSATIONS,
            data: data,
          });
        });
      break;
    }

    case MESSAGE_ACTIONS.REFRESH: {
      console.log("refresh");
      handleStartFetchingConversations(sender.tab.id, true);
      break;
    }

    case MESSAGE_ACTIONS.START_FETCHING_CONVERSATION_DETAIL: {
      console.log("start fetching conversation detail");
      handleStartFetchingAllConversationDetails(sender.tab.id);
      break;
    }
    default: {
      console.log("unknown message type", request.type);
    }
  }
});

import {
  fetch_conversation_detail,
  fetchAllConversations,
  fetchAllConversationsWithDetail,
  fetchNewConversations,
  getAccessToken,
} from "@src/api";
import { ACCESS_TOKEN_KEY, MESSAGE_ACTIONS } from "@src/constants";
import { db, initDB } from "@src/db";
import { FetchFilteredConversationData } from "@src/types";
import { batchPromises } from "@src/utils";
import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate("pages/content/style.scss");

console.log("background loaded 6");

const PAGE_SIZE = 20;

const sendMessageToTab = (tabId, data) => chrome.tabs.sendMessage(tabId, data);

type UserInfo = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  accessToken: string;
};

class UserManager {
  background: BackgroundManager;
  info: UserInfo;

  constructor(background: BackgroundManager) {
    this.background = background;
  }

  setUserInfo(userInfo: UserInfo) {
    this.info = userInfo;
  }
}

const EVENTS = {
  ON_SESSION_READY: "ON_SESSION_READY",
};

class BackgroundManager {
  USERS_KEY = "users";
  users: Record<string, UserInfo> = {};
  currentUser: UserManager;
  messageHandlerMap: Record<
    string,
    (request: any, sender: any, sendResponse: any) => void
  >;
  eventQueue: {
    [EVENTS.ON_SESSION_READY]: [];
  };

  constructor() {
    this.currentUser = new UserManager(this);

    // load existing users
    chrome.storage.local.get([this.USERS_KEY], (res) => {
      this.users = JSON.parse(res[this.USERS_KEY] || "{}");
      console.log("loaded user list", this.users);

      if (Object.keys(this.users).length > 0) {
        this.currentUser.info = Object.values(this.users)[0];
      }
    });

    this.handleInit = this.handleInit.bind(this);
    this.handleFetchConversations = this.handleFetchConversations.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.handleFetchFolders = this.handleFetchFolders.bind(this);
    this.handleCreateNewFolder = this.handleCreateNewFolder.bind(this);
    this.handleAddConversationToFolder = this.handleAddConversationToFolder
      .bind(this);

    this.messageHandlerMap = {
      [MESSAGE_ACTIONS.INIT]: this.handleInit,
      [MESSAGE_ACTIONS.APPEND_CONVERSATIONS]: this.handleFetchConversations,
      [MESSAGE_ACTIONS.REFRESH]: this.handleRefresh,
      [MESSAGE_ACTIONS.APPEND_FOLDERS]: this.handleFetchFolders,
      [MESSAGE_ACTIONS.CREATE_NEW_FOLDER]: this.handleCreateNewFolder,
      [MESSAGE_ACTIONS.ADD_CONVERSATION_TO_FOLDER]:
        this.handleAddConversationToFolder,
    };

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("background received message ", request);
      if (this.messageHandlerMap[request.type]) {
        this.messageHandlerMap[request.type](request, sender, sendResponse);
      } else {
        console.log("unknown request type", request.type);
      }
    });

    console.log(this.messageHandlerMap);
  }

  async handleInit(request, sender, sendResponse) {
    console.log("start handle init");
    await this.getOrRefreshSession();
    // console.log("access token", this.getCurrentUserAccessToken());

    const ac = this.getCurrentUserAccessToken();

    const latestConItem = await db.getLatestConversation();
    if (latestConItem) {
      const latestDate = new Date(latestConItem.update_time);
      console.log("latest conversation", latestDate);

      const newItems = await fetchNewConversations(ac, latestDate);
      await db.putManyConversations(newItems);
    } else {
      console.log("nothing in db. fetching all conversations");
      const conList = await fetchAllConversations(ac);
      await db.putManyConversations(conList);
    }

    await this.sendAllFolderData(sender.tab.id);
    await this.sendFirstPageConversations(sender.tab.id);

    // let c = await fetchAllConversations(ac);
  }

  async handleFetchConversations(request, sender, _) {
    const { pageSize, page } = request.data;
    const data = await db.getManyConversations(pageSize, (page - 1) * pageSize);
    console.log("sending append conversation data", data);
    sendMessageToTab(sender.tab.id, {
      type: MESSAGE_ACTIONS.APPEND_CONVERSATIONS,
      data,
    });
  }

  async handleFetchFolders(request, sender, _) {
    console.log("handle fetch folders");
    await this.sendAllFolderData(sender.tab.id);
  }

  async handleRefresh(request, sender, _) {
    this.handleInit(request, sender, _);
  }

  async handleCreateNewFolder(request, sender, _) {
    const { name, color, children } = request.data;
    const data = await db.createNewFolder({
      name,
      color,
      children,
    });
    sendMessageToTab(sender.tab.id, {
      type: MESSAGE_ACTIONS.STATUS_SUCCESS,
      data,
    });
    await this.sendAllFolderData(sender.tab.id);
  }

  async handleAddConversationToFolder(request, sender, _) {
    const { conversationId, folderId } = request.data;
    try {
      const res = await db.addConversationToFolder(conversationId, folderId);
      console.log("success addConversationToFolder");
      sendMessageToTab(sender.tab.id, {
        type: MESSAGE_ACTIONS.RESPONSE_STATUS,
        data: {
          status: "SUCCESS",
        },
      });

      // refresh data
      const data = await db.getManyFolders(undefined, undefined);
      console.log("sending append folder data", data);
      sendMessageToTab(sender.tab.id, {
        type: MESSAGE_ACTIONS.FETCH_FOLDERS,
        data,
      });
    } catch (err) {
      console.warn("error during addConversationToFolder:", err.message);
      sendMessageToTab(sender.tab.id, {
        type: MESSAGE_ACTIONS.RESPONSE_STATUS,
        data: {
          status: "ERROR",
          message: err.message,
        },
      });
    }
  }

  async getOrRefreshSession() {
    const user = await getAccessToken();
    if (!user) return null;

    this.currentUser.info = { ...user };

    // save access token
    if (!this.users[user.id]) {
      console.log("added new user", user);
    }
    this.users[user.id] = { ...(this.users[user.id] || {}), ...user };

    // save user id
    await this.saveUsers();

    console.log("saved access token");

    initDB(user.id);
  }

  async saveUsers() {
    await chrome.storage.local.set({
      [this.USERS_KEY]: JSON.stringify(this.users),
    });
  }

  getCurrentUserAccessToken() {
    return this.currentUser.info.accessToken;
  }

  getCurrentUser() {
    return this.currentUser.info;
  }

  async sendFirstPageConversations(tabId: string) {
    const data = await db.getManyConversations(PAGE_SIZE, 0);

    sendMessageToTab(tabId, {
      type: MESSAGE_ACTIONS.FETCH_CONVERSATIONS,
      data,
    });
  }

  async sendAllFolderData(tabId: string) {
    const data = await db.folders.orderBy("update_time").toArray();
    sendMessageToTab(tabId, {
      type: MESSAGE_ACTIONS.FETCH_FOLDERS,
      data,
    });
  }
}

const backgroundManager = new BackgroundManager();

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

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log("background received message ", {
//     type: request.type,
//   });
//   switch (request.type) {
//     case MESSAGE_ACTIONS.INIT: {
//       console.log("Initializing");
//       handleStartFetchingConversations(sender.tab.id);

//       // fetch and send app state
//       chrome.storage.local.get(APP_STATE_KEY, (state) => {
//         state = state || { toggleState: false };
//         console.log("app state", state[APP_STATE_KEY]);
//         chrome.tabs.sendMessage(sender.tab.id, {
//           type: MESSAGE_ACTIONS.FETCHING_APP_STATE,
//           data: state[APP_STATE_KEY],
//         });
//       });
//       break;
//     }

//     case MESSAGE_ACTIONS.SAVE_APP_STATE: {
//       console.log("saving app state", request.data);
//       chrome.storage.local.set({
//         appState: {
//           ...chrome.storage.local.get(APP_STATE_KEY),
//           ...request.data,
//         },
//       });
//       break;
//     }

//     case MESSAGE_ACTIONS.FETCH_FILTERED_CONVERSATIONS: {
//       const reqData: FetchFilteredConversationData = request.data;
//       const { title } = reqData;
//       console.log("fetch filtered conversations", request.data);
//       db.conversations
//         .orderBy("update_time")
//         .reverse()
//         .filter((c) => {
//           const regex = new RegExp(title, "i");
//           return regex.test(c.title);
//         })
//         .toArray()
//         .then((data) => {
//           data = data.map((d) => {
//             return {
//               ...d,
//               title: d.title.replace(
//                 new RegExp(title, "i"),
//                 `<mark class="chatgpt-archive-highlight">${title}</mark>`
//               ),
//             };
//           });
//           console.log("res data", data);
//           chrome.tabs.sendMessage(sender.tab.id, {
//             type: MESSAGE_ACTIONS.FINISH_SEARCHING_CONVERSATIONS,
//             data: data,
//           });
//         });
//       break;
//     }

//     case MESSAGE_ACTIONS.REFRESH: {
//       console.log("refresh");
//       handleStartFetchingConversations(sender.tab.id, true);
//       break;
//     }

//     case MESSAGE_ACTIONS.START_FETCHING_CONVERSATION_DETAIL: {
//       console.log("start fetching conversation detail");
//       handleStartFetchingAllConversationDetails(sender.tab.id);
//       break;
//     }

//     default: {
//       console.log("unknown message type", request.type);
//     }
//   }
// });

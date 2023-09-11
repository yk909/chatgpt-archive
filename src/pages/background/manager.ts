import { db, initDB } from "@src/db";
import { FetchFilteredConversationData } from "@src/types";
import { ACCESS_TOKEN_KEY, MESSAGE_ACTIONS } from "@src/constants";
import {
  fetch_conversation_detail,
  fetchAllConversations,
  fetchAllConversationsWithDetail,
  fetchNewConversations,
  getAccessToken,
} from "@src/api";
import { sendMessageToTab } from "./utils";
import { PAGE_SIZE } from "./config";

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

export class BackgroundManager {
  USERS_KEY = "users";
  users: Record<string, UserInfo> = {};
  currentUser: UserManager;
  messageHandlerMap: Record<
    string,
    (request: any, sender: any, sendResponse: any) => void
  >;

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
    this.handleAddConversationToFolder =
      this.handleAddConversationToFolder.bind(this);
    this.handleRenameFolder = this.handleRenameFolder.bind(this);

    this.messageHandlerMap = {
      [MESSAGE_ACTIONS.INIT]: this.handleInit,
      [MESSAGE_ACTIONS.APPEND_CONVERSATIONS]: this.handleFetchConversations,
      [MESSAGE_ACTIONS.REFRESH]: this.handleRefresh,
      [MESSAGE_ACTIONS.APPEND_FOLDERS]: this.handleFetchFolders,
      [MESSAGE_ACTIONS.CREATE_NEW_FOLDER]: this.handleCreateNewFolder,
      [MESSAGE_ACTIONS.ADD_CONVERSATION_TO_FOLDER]:
        this.handleAddConversationToFolder,
      [MESSAGE_ACTIONS.RENAME_FOLDER]: this.handleRenameFolder,
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
    await this.sendAllConversations(sender.tab.id);
    // await this.sendFirstPageConversations(sender.tab.id);
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
      type: MESSAGE_ACTIONS.RESPONSE_STATUS,
      data: {
        status: "SUCCESS",
        message: "Successfully created new folder",
      },
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

  async handleRenameFolder(request, sender, _) {
    const { folderId, name } = request.data;
    try {
      const res = await db.renameFolder(folderId, name);
      console.log("success renameFolder");
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
      console.warn("error during renameFolder:", err.message);
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

  async sendAllConversations(tabId: string) {
    const data = await db.getManyConversations(undefined, undefined);
    sendMessageToTab(tabId, {
      type: MESSAGE_ACTIONS.FETCH_CONVERSATIONS,
      data,
    });
  }

  async sendAllFolderData(tabId: string) {
    const data = await db.getManyFolders(undefined, undefined);
    sendMessageToTab(tabId, {
      type: MESSAGE_ACTIONS.FETCH_FOLDERS,
      data,
    });
  }
}

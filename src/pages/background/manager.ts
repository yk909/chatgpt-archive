import { db, initDB } from "@src/db";
import { FetchFilteredConversationData } from "@src/types";
import { ACCESS_TOKEN_KEY, MESSAGE_ACTIONS } from "@src/constants";
import {
  fetch_conversation_detail,
  fetchAllConversations,
  fetchAllConversationsWithDetail,
  fetchConversationDetails,
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
    this.handleDeleteFolder = this.handleDeleteFolder.bind(this);
    this.handleSearch = this.handleSearch.bind(this);

    this.messageHandlerMap = {
      [MESSAGE_ACTIONS.INIT]: this.handleInit,
      [MESSAGE_ACTIONS.APPEND_CONVERSATIONS]: this.handleFetchConversations,
      [MESSAGE_ACTIONS.REFRESH]: this.handleRefresh,
      [MESSAGE_ACTIONS.APPEND_FOLDERS]: this.handleFetchFolders,
      [MESSAGE_ACTIONS.CREATE_NEW_FOLDER]: this.handleCreateNewFolder,
      [MESSAGE_ACTIONS.ADD_CONVERSATION_TO_FOLDER]:
        this.handleAddConversationToFolder,
      [MESSAGE_ACTIONS.RENAME_FOLDER]: this.handleRenameFolder,
      [MESSAGE_ACTIONS.DELETE_FOLDER]: this.handleDeleteFolder,
      [MESSAGE_ACTIONS.SEARCH]: this.handleSearch,
    };

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("background received message ", request);
      if (this.messageHandlerMap[request.type]) {
        try {
          this.messageHandlerMap[request.type](request, sender, sendResponse);
        } catch (err) {
          console.error("error during handling message", err);
          this.sendResponseStatus(sender, {
            status: "ERROR",
            message: err.message,
          });
        }
      } else {
        console.log("unknown request type", request.type);
      }
    });

    console.log(this.messageHandlerMap);
  }

  async handleInit(request, sender, sendResponse) {
    console.log("start handle init");
    await this.getOrRefreshSession();
    const ac = this.getCurrentUserAccessToken();

    await this.sendAllConversations(sender.tab.id);
    await this.sendAllFolderData(sender.tab.id);

    const latestConItem = await db.getLatestConversation();
    if (!latestConItem) {
      const conList = await fetchAllConversations(ac);
      await db.putManyConversations(conList);
      await this.sendAllConversations(sender.tab.id);
    } else {
      const latestDate = new Date(latestConItem.update_time);
      console.log("latest conversation", latestDate);

      const newItems = await fetchNewConversations(ac, latestDate);
      await db.putManyConversations(newItems);

      if (newItems.length > 0) {
        await this.sendAllConversations(sender.tab.id);
      }
    }
  }

  async sendResponseStatus(sender, data) {
    sendMessageToTab(sender.tab.id, {
      type: MESSAGE_ACTIONS.RESPONSE_STATUS,
      data,
    });
  }

  async handleFetchConversations(request, sender, _) {
    const { pageSize, page, sortBy, desc } = request.data;
    const data = await db.getManyConversations(
      pageSize,
      (page - 1) * pageSize,
      sortBy,
      desc
    );
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
    await db.createNewFolder({
      name,
      color,
      children,
    });
    await this.sendResponseStatus(sender, {
      status: "SUCCESS",
      message: "Successfully created new folder",
    });
    await this.sendAllFolderData(sender.tab.id);
  }

  async handleAddConversationToFolder(request, sender, _) {
    const { conversationId, folderId } = request.data;
    await db.addConversationToFolder(conversationId, folderId);
    console.log("success addConversationToFolder");
    await this.sendResponseStatus(sender, {
      status: "SUCCESS",
      message: "Successfully added conversation to folder",
    });

    // refresh data
    const data = await db.getManyFolders(undefined, undefined);
    console.log("sending append folder data", data);
    sendMessageToTab(sender.tab.id, {
      type: MESSAGE_ACTIONS.FETCH_FOLDERS,
      data,
    });
  }

  async handleRenameFolder(request, sender, _) {
    const { folderId, name } = request.data;
    await db.renameFolder(folderId, name);
    console.log("success renameFolder");
    sendMessageToTab(sender.tab.id, {
      type: MESSAGE_ACTIONS.RESPONSE_STATUS,
      data: {
        status: "SUCCESS",
        message: "Successfully renamed folder",
      },
    });

    // refresh data
    const data = await db.getManyFolders(undefined, undefined);
    console.log("sending append folder data", data);
    sendMessageToTab(sender.tab.id, {
      type: MESSAGE_ACTIONS.FETCH_FOLDERS,
      data,
    });
  }

  async handleDeleteFolder(request, sender, _) {
    const { folderIdList } = request.data;
    await db.deleteFolder(folderIdList);
    console.log("delete folder successful", { folderIdList });
    await this.sendResponseStatus(sender, {
      status: "SUCCESS",
      message: `Successfully deleted ${folderIdList.length} folder(s)`,
    });
    this.sendAllFolderData(sender.tab.id);
  }

  async handleSearch(request, sender, _) {
    const { query } = request.data;
    const conversations = await db.searchConversations(query);
    const folders = await db.searchFolders(query);
    console.log("finishe search", { conversations, folders });
    sendMessageToTab(sender.tab.id, {
      type: MESSAGE_ACTIONS.SEARCH,
      data: { conversations, folders },
    });
  }

  async updateLatestConversationDetails() {
    const cList = (
      await db.conversations.orderBy("update_time").reverse().toArray()
    ).map((c) => ({ id: c.id, messageStr: c.messageStr }));
    let j = 0;
    for (let i = cList.length - 1; i > -1; i--) {
      if (!cList[i].messageStr) {
        j = i;
        break;
      }
    }
    const ac = this.getCurrentUserAccessToken();
    const onUpdate = (cur: number, total: number) => {
      console.log("conversation detail update", { cur, total });
    };
    const cDetailList = await fetchConversationDetails(
      cList.slice(0, j + 1).map((c) => c.id),
      ac,
      onUpdate
    );
    console.log(`saving ${cDetailList.length} updated conversation details`);
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

  async sendAllConversations(
    tabId: string,
    sortBy = "update_time",
    desc = true
  ) {
    const data = await db.getManyConversations(
      undefined,
      undefined,
      sortBy,
      desc
    );
    sendMessageToTab(tabId, {
      type: MESSAGE_ACTIONS.FETCH_CONVERSATIONS,
      data,
    });
  }

  async sendAllFolderData(tabId: string, sortBy = "update_time", desc = true) {
    const data = await db.getManyFolders(undefined, undefined, sortBy, desc);
    sendMessageToTab(tabId, {
      type: MESSAGE_ACTIONS.FETCH_FOLDERS,
      data,
    });
  }
}

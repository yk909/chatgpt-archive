import { db, initDB } from "@src/db";
import { ACCESS_TOKEN_KEY, MESSAGE_ACTIONS } from "@src/constants";
import {
  fetchAllConversations,
  fetchConversationDetails,
  fetchNewConversations,
  getAccessToken,
} from "@src/api";
import { extractMessageString, sendMessageToTab } from "./utils";
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

  detailFetchingState: Record<
    string,
    {
      tabIds: number[];
      current: number;
      total: number;
      inProgress: boolean;
    }
  > = {};

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

    this.messageHandlerMap = {
      [MESSAGE_ACTIONS.INIT]: this.handleInit,
      // [MESSAGE_ACTIONS.APPEND_CONVERSATIONS]: this.handleFetchConversations,
      [MESSAGE_ACTIONS.FETCH_CONVERSATIONS]: this.handleFetchConversations,
      [MESSAGE_ACTIONS.REFRESH]: this.handleRefresh,
      [MESSAGE_ACTIONS.APPEND_FOLDERS]: this.handleFetchFolders,
      [MESSAGE_ACTIONS.CREATE_NEW_FOLDER]: this.handleCreateNewFolder,
      [MESSAGE_ACTIONS.ADD_CONVERSATIONS_TO_FOLDER]:
        this.handleAddConversationsToFolder,
      [MESSAGE_ACTIONS.RENAME_FOLDER]: this.handleRenameFolder,
      [MESSAGE_ACTIONS.DELETE_FOLDER]: this.handleDeleteFolder,
      [MESSAGE_ACTIONS.DELETE_CONVERSATIONS_FROM_FOLDER]:
        this.handleDeleteConversationsFromFolder,

      [MESSAGE_ACTIONS.SEARCH]: this.handleSearch,

      [MESSAGE_ACTIONS.PIN_CONVERSATION]: this.handleTogglePinConversation,
    };

    // set up listeners for messages from from content script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("background received message ", request);
      if (!db && !!this.currentUser.info) initDB(this.currentUser.info.id);
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

    // set up listeners for tab closing events
    chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
      for (const state of Object.values(this.detailFetchingState)) {
        const index = state.tabIds.indexOf(tabId);
        if (index !== -1) {
          state.tabIds.splice(index, 1);
        }
      }
    });
  }

  handleInit = async (request, sender, sendResponse) => {
    console.log("start handle init", db);
    await this.getOrRefreshSession();
    const ac = this.getCurrentUserAccessToken();

    await this.sendAllData(sender.tab.id);

    const latestConItem = await db.getLatestConversation();
    if (!latestConItem) {
      // no conversation, fetch all conversations
      const conList = await fetchAllConversations(ac);
      await db.putManyConversations(conList);
      await this.sendAllConversations(sender.tab.id);
    } else {
      // only fetch the new ones based on the latest conversation

      const latestDate = new Date(latestConItem.update_time);

      const newItems = await fetchNewConversations(ac, latestDate);
      await db.putManyConversations(newItems);

      if (newItems.length > 0) {
        await this.sendAllConversations(sender.tab.id);
      }
    }

    let state = this.detailFetchingState[this.currentUser.info.id];
    if (!state) {
      state = {
        tabIds: [sender.tab.id],
        current: 0,
        total: 0,
        inProgress: false,
      };
      this.detailFetchingState[this.currentUser.info.id] = state;
    } else if (!state.tabIds.includes(sender.tab.id)) {
      state.tabIds.push(sender.tab.id);
    }

    if (!state.inProgress) {
      state.inProgress = true;
      const conWithoutDetails = await db.getConversationWithoutMessage();
      state.total = conWithoutDetails.length;
      state.current = 0;
      console.log(
        "start fetching conversation details for",
        conWithoutDetails.length
      );
      const onUpdate = async (current: number, total: number, curVal: any) => {
        const msgStr = extractMessageString(curVal);
        await db.conversations.update(curVal.conversation_id, {
          messageStr: msgStr,
        });
        console.log("conversation detail update", {
          current,
          total,
          val: curVal.conversation_id,
          // msgStr,
        });
        state.current = current;
        state.total = total;
        for (const tabId of state.tabIds) {
          sendMessageToTab(tabId, {
            type: MESSAGE_ACTIONS.PROGRESS,
            data: { current, total },
          });
        }
      };

      const cDetailList = await fetchConversationDetails(
        conWithoutDetails,
        ac,
        onUpdate
      );
      // console.log("fetched conversation details", cDetailList);
      console.log(`saving ${cDetailList.length} updated conversation details`);
      state.inProgress = false;
    }
  };

  async sendResponseStatus(sender, data) {
    sendMessageToTab(sender.tab.id, {
      type: MESSAGE_ACTIONS.RESPONSE_STATUS,
      data,
    });
  }

  handleFetchConversations = async (request, sender, _) => {
    const { pageSize, page, sortBy, desc } = request.data;
    const data = await db.getManyConversations(
      pageSize,
      page && (page - 1) * pageSize,
      sortBy,
      desc
    );
    console.log("sending append conversation data", data);
    sendMessageToTab(sender.tab.id, {
      type: MESSAGE_ACTIONS.FETCH_CONVERSATIONS,
      data,
    });
  };

  handleFetchFolders = async (request, sender, _) => {
    await this.sendAllFolderData(sender.tab.id);
  };

  handleRefresh = async (request, sender, _) => {
    this.handleInit(request, sender, _);
    sendMessageToTab(sender.tab.id, {
      type: MESSAGE_ACTIONS.REFRESH,
      data: {
        isRefreshing: false,
      },
    });
  };

  handleCreateNewFolder = async (request, sender, _) => {
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
  };

  handleAddConversationsToFolder = async (request, sender, _) => {
    const { conversationIdList, folderId } = request.data;
    await db.addConversationsToFolder(conversationIdList, folderId);
    console.log("success addConversationToFolder");
    await this.sendResponseStatus(sender, {
      status: "SUCCESS",
      message: "Successfully added conversation to folder",
    });

    // refresh data
    await this.sendAllFolderData(sender.tab.id);
    // const data = await db.getManyFolders(undefined, undefined);
    // console.log("sending append folder data", data);
    // sendMessageToTab(sender.tab.id, {
    //   type: MESSAGE_ACTIONS.FETCH_FOLDERS,
    //   data,
    // });
  };

  handleDeleteConversationsFromFolder = async (request, sender, _) => {
    const { conversationIdList, folderId } = request.data;
    await db.deleteConversationsFromFolder(conversationIdList, folderId);
    sendMessageToTab(sender.tab.id, {
      type: MESSAGE_ACTIONS.RESPONSE_STATUS,
      data: {
        status: "SUCCESS",
        message: `Successfully deleted ${conversationIdList.length} conversation(s) from folder`,
      },
    });
  };

  handleRenameFolder = async (request, sender, _) => {
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
  };

  handleDeleteFolder = async (request, sender, _) => {
    const { folderIdList } = request.data;
    await db.deleteFolder(folderIdList);
    console.log("delete folder successful", { folderIdList });
    await this.sendResponseStatus(sender, {
      status: "SUCCESS",
      message: `Successfully deleted ${folderIdList.length} folder(s)`,
    });
    this.sendAllFolderData(sender.tab.id);
  };

  handleSearch = async (request, sender, _) => {
    const { query } = request.data;
    if (!db) initDB(this.currentUser.info.id);
    const conversations = await db.searchConversations(query);
    const folders = await db.searchFolders(query);
    console.log("finishe search", { conversations, folders });
    sendMessageToTab(sender.tab.id, {
      type: MESSAGE_ACTIONS.SEARCH,
      data: { conversations, folders },
    });
  };

  handleTogglePinConversation = async (request, sender, _) => {
    const { conversationId } = request.data;
    await db.togglePinConversation(conversationId);
    await this.sendPinConversations(sender.tab.id);
    await this.sendResponseStatus(sender, {
      status: "SUCCESS",
      message: "Successfully toggled pinned conversation",
    });
  };

  updateLatestConversationDetails = async () => {
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
  };

  getOrRefreshSession = async () => {
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
  };

  saveUsers = async () => {
    await chrome.storage.local.set({
      [this.USERS_KEY]: JSON.stringify(this.users),
    });
  };

  getCurrentUserAccessToken = () => {
    return this.currentUser.info.accessToken;
  };

  getCurrentUser = () => {
    return this.currentUser.info;
  };

  sendFirstPageConversations = async (tabId: string) => {
    const data = await db.getManyConversations(PAGE_SIZE, 0);

    sendMessageToTab(tabId, {
      type: MESSAGE_ACTIONS.FETCH_CONVERSATIONS,
      data,
    });
  };

  sendAllConversations = async (
    tabId: string,
    sortBy = "update_time",
    desc = true
  ) => {
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
  };

  sendAllFolderData = async (
    tabId: string,
    sortBy = "update_time",
    desc = true
  ) => {
    const data = await db.getManyFolders(undefined, undefined, sortBy, desc);
    sendMessageToTab(tabId, {
      type: MESSAGE_ACTIONS.FETCH_FOLDERS,
      data,
    });
  };

  sendPinConversations = async (tabId: string) => {
    const data = await db.getPinConversations();
    sendMessageToTab(tabId, {
      type: MESSAGE_ACTIONS.PIN_CONVERSATION,
      data,
    });
  };

  sendAllData = async (tabId: string) => {
    const folders = await db.getManyFolders(
      undefined,
      undefined,
      "update_time",
      true
    );
    const conversations = await db.getManyConversations(
      undefined,
      undefined,
      "update_time",
      true
    );
    const pinConversations = await db.getPinConversations();
    sendMessageToTab(tabId, {
      type: MESSAGE_ACTIONS.REFRESH,
      data: {
        folders,
        conversations,
        pinConversations,
      },
    });
  };
}

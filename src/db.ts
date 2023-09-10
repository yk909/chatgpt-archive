import Dexie from "dexie";
import { Conversation, Folder, FolderCreationData } from "./types";

type ConversationToFolderData = {
  conversationId: string;
  folderId: string;
  created_time: string;
  update_time: string;
};

export class RootDB extends Dexie {
  conversations: Dexie.Table<Conversation, string>;
  folders: Dexie.Table<Folder, string>;
  conversationToFolder: Dexie.Table<ConversationToFolderData, number>;

  constructor(username: string) {
    super("ca-db-" + username);
    this.version(1).stores({
      conversations: "&id, title, created_time, update_time",
      folders: "&id, name, created_time, update_time",
      conversationToFolder:
        "++id, conversationId, folderId, created_time, update_time",
    });
  }

  getManyConversations(
    limit: number | undefined = undefined,
    offset: number | undefined = undefined,
    orderBy = "update_time",
    desc = true,
  ) {
    let q = this.conversations.orderBy(orderBy);
    if (desc) {
      q = q.reverse();
    }
    if (offset) {
      q = q.offset(offset);
    }
    if (limit) {
      q = q.limit(limit);
    }
    return q.toArray();
  }

  putManyConversations(conversations: Conversation[]) {
    return this.conversations.bulkPut(conversations);
  }

  getLatestConversation() {
    return this.conversations.orderBy("update_time").reverse().first();
  }

  async getManyFolders(
    limit: number | undefined = undefined,
    offset: number | undefined = undefined,
    orderBy = "update_time",
    desc = true,
  ) {
    let q = this.folders.orderBy(orderBy);
    if (desc) {
      q = q.reverse();
    }
    if (offset) {
      q = q.offset(offset);
    }
    if (limit) {
      q = q.limit(limit);
    }
    const folders = await q.toArray();
    const conIdSet = new Set();
    const fChildrenList = (await Promise.allSettled(
      folders.map((f) =>
        db.conversationToFolder.where({ folderId: f.id }).toArray()
      ),
    )).map((p) => p["status"] === "fulfilled" ? p["value"] : []);
    for (let i = 0; i < fChildrenList.length; i++) {
      for (let j = 0; j < fChildrenList[i].length; j++) {
        conIdSet.add(fChildrenList[i][j].conversationId);
      }
    }
    const conIdList = Array.from(conIdSet);
    const conList = await db.conversations.bulkGet(conIdList);
    const conversationIdMap = conIdList.reduce(
      (obj: Record<string, any>, key: string, i: number) => ({
        ...obj,
        [key]: conList[i],
      }),
      {},
    );
    console.log("fChildrenList", fChildrenList);
    for (let i = 0; i < folders.length; i++) {
      const f = folders[i];
      f.children = fChildrenList[i].map((r) =>
        conversationIdMap[r.conversationId]
      );
    }
    return folders;
  }

  async createNewFolder(
    data: FolderCreationData,
  ) {
    const folderId = crypto.randomUUID();
    const curDatetime = Date.now().toString();
    if (data.children.length !== 0) {
      for (let i = 0; i < data.children.length; i++) {
        const conId = data.children[i];
        const con = await db.conversations.get(conId);
        if (!con) {
          console.warn("Conversation ID " + conId + " does not exist");
          return;
        }
        await db.conversationToFolder.put({
          folderId,
          conversationId: conId,
          update_time: curDatetime,
          created_time: curDatetime,
        });
      }
    }
    delete data.children;
    const folder = {
      ...data,
      id: folderId,
      update_time: curDatetime,
      created_time: curDatetime,
    };
    return this.folders.add(folder);
  }

  async addConversationToFolder(conId: string, folderId: string) {
    const con = await db.conversations.get(conId);
    if (!con) {
      throw new Error("No conversation found with id");
    }
    const folder = await db.folders.get(folderId);
    if (!folder) {
      throw new Error("No folder found with id");
    }
    const cTof = await db.conversationToFolder.where({
      conversationId: conId,
      folderId,
    }).toArray();
    if (cTof.length !== 0) {
      throw new Error("Conversation already exists in folder");
    }
    db.conversationToFolder.add({
      conversationId: conId,
      folderId,
      update_time: Date.now().toString(),
      created_time: Date.now().toString(),
    });
    // return db.transaction("rw", db.conversations, db.folders, async () => {
    // });
  }
}

let db: RootDB;

export function initDB(username: string) {
  db = new RootDB(username);
  console.log("db", db);
}

export { db };

import Dexie from "dexie";

type ConversationToFolderData = {
  conversationId: string;
  folderId: string;
  create_time: string;
  update_time: string;
};

type messageToFolderData = {
  conversationId: string;
  messageId: string;
  folderId: string;
  create_time: string;
  update_time: string;
};

export class RootDB extends Dexie {
  conversations: Dexie.Table<Conversation, string>;
  folders: Dexie.Table<FolderWithoutChildren, string>;
  conversationToFolder: Dexie.Table<ConversationToFolderData, number>;
  messageToFolder: Dexie.Table<messageToFolderData, number>;

  constructor(username: string) {
    super("ca-db-" + username);
    this.version(1).stores({
      conversations: "&id, title, create_time, update_time",
      folders: "&id, name, create_time, update_time",
      conversationToFolder:
        "++id, conversationId, folderId, create_time, update_time",
      messageToFolder:
        "++id, conversationId, messageId, folderId, create_time, update_time",
    });
  }

  async getManyConversations(
    limit: number | undefined = undefined,
    offset: number | undefined = undefined,
    sortBy = "update_time",
    desc = true
  ) {
    const c = await this.conversations.count();
    if (c === 0) {
      return [];
    }
    let q = this.conversations.orderBy(sortBy);
    if (desc) {
      q = q.reverse();
    }
    if (offset) {
      q = q.offset(offset);
    }
    if (limit) {
      q = q.limit(limit);
    }
    return (await q.toArray()).map((c) => ({
      ...c,
      messageStr: undefined,
    }));
  }

  async getConversationWithoutMessage(): Promise<string[]> {
    const c = await this.conversations.count();
    if (c === 0) {
      return [];
    }
    let q = this.conversations.orderBy("update_time").reverse();
    return (await q.toArray()).filter((c) => !c.messageStr).map((c) => c.id);
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
    sortBy = "update_time",
    desc = true
  ) {
    const c = await this.folders.count();
    if (c === 0) {
      return [];
    }
    let q = this.folders.orderBy(sortBy);
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
    const conIdSet = new Set<string>();
    const fChildrenList = (
      await Promise.allSettled(
        folders.map((f) =>
          db.conversationToFolder.where({ folderId: f.id }).toArray()
        )
      )
    ).map((p) => (p["status"] === "fulfilled" ? p["value"] : []));
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
      {}
    );
    // for (let i = 0; i < folders.length; i++) {
    //   const f = folders[i];
    //   f.children = fChildrenList[i].map( (r) => conversationIdMap[r.conversationId]);
    // }
    return folders.map((f, i) => ({
      ...f,
      children: fChildrenList[i].map(
        (r) => conversationIdMap[r.conversationId]
      ),
    }));
  }

  async createNewFolder(data: FolderCreationData) {
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
          create_time: curDatetime,
        });
      }
    }
    delete data.children;
    const folder = {
      ...data,
      id: folderId,
      update_time: curDatetime,
      create_time: curDatetime,
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
    const cTof = await db.conversationToFolder
      .where({
        conversationId: conId,
        folderId,
      })
      .toArray();
    if (cTof.length !== 0) {
      throw new Error("Conversation already exists in folder");
    }
    db.conversationToFolder.add({
      conversationId: conId,
      folderId,
      update_time: Date.now().toString(),
      create_time: Date.now().toString(),
    });
  }

  async renameFolder(folderId: string, name: string) {
    const folder = await db.folders.get(folderId);
    if (!folder) {
      throw new Error("No folder found with id");
    }
    return db.folders.update(folderId, {
      name,
      update_time: Date.now().toString(),
    });
  }

  async deleteFolder(folderIdList: string[]) {
    const folderExists = await Promise.all(
      folderIdList.map((folderId) => db.folders.get(folderId))
    );
    if (folderExists.some((f) => !f)) {
      throw new Error("Some folders do not exist");
    }
    await db.folders.bulkDelete(folderIdList);
    for (let i = 0; i < folderIdList.length; i++) {
      const folderId = folderIdList[i];
      await db.conversationToFolder.where({ folderId }).delete();
    }
  }

  async searchConversations(
    query: string,
    sortBy = "update_time",
    desc = true
  ) {
    const conversations = (
      await this.conversations.orderBy(sortBy).reverse().toArray()
    )
      .map((d) => {
        const regex2 = new RegExp(query, "gi");
        const msgCount = (d.messageStr?.match(regex2) || []).length;
        const titleCount = (d.title.match(regex2) || []).length;
        return {
          ...d,
          keywordCount: titleCount + msgCount,
          messageStr: undefined,
        };
      })
      .filter((c) => {
        const regex = new RegExp(query, "i");
        return regex.test(c.title) || c.keywordCount > 0;
      });
    conversations.sort(
      (a: ConversationWithKeywordCount, b: ConversationWithKeywordCount) => {
        if (a.keywordCount !== b.keywordCount) {
          return b.keywordCount - a.keywordCount;
        }
        return (
          new Date(b.update_time).getTime() - new Date(a.update_time).getTime()
        );
      }
    );

    return conversations;
  }

  async searchFolders(query: string, sortBy = "update_time") {
    const data = (
      await this.getManyFolders(undefined, undefined, sortBy, true)
    ).filter((f) => {
      const reg = new RegExp(query, "i");
      return reg.test(f.name);
    });

    return data;
  }
}

let db: RootDB;

export function initDB(username: string) {
  db = new RootDB(username);
}

export { db };

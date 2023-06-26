import Dexie from "dexie";
import { Conversation } from "./types";

export class ConversationDB extends Dexie {
  conversations: Dexie.Table<Conversation, number>;

  constructor(username) {
    super("ConversationDB-" + username);
    this.version(1).stores({
      conversations: "&id, title, created_time, update_time",
    });
    // this.conversations = this.table("conversations");
  }
}

let db;

export function initDB(username) {
  db = new ConversationDB(username);
  console.log("db", db);
}

export { db };

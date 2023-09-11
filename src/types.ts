export interface Conversation {
  id: string;
  title: string;
  current_node: string | null;
  mapping: null;
  update_time: string;
  created_time: string;
}

export interface FetchFilteredConversationData {
  title: string;
}

export type Folder = {
  id: string;
  name: string;
  color?: string;
  update_time: string;
  created_time: string;
  children: Conversation[];
};

export type FolderCreationData = {
  name: string;
  color?: string;
  children: string[];
};

export type MessageHandler = (request: any, sender, sendResponse) => void;

export type KeyboardShortcutItem = {
  name: string;
  callback: () => void;
  keyCondition: (e: KeyboardEvent) => boolean;
};

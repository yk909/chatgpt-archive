export interface Conversation {
  id: string;
  title: string;
  current_node: string | null;
  mapping: null;
  update_time: string;
  create_time: string;
}

export interface FetchFilteredConversationData {
  title: string;
}

export type FolderCreationData = {
  name: string;
  color?: string;
  children: string[];
};

export type FolderWithoutChildren = {
  id: string;
  update_time: string;
  create_time: string;
} & FolderCreationData;

export type Folder = FolderWithoutChildren & {
  children: Conversation[];
};

export type MessageHandler = (request: any, sender, sendResponse) => void;

export type KeyboardShortcutItem = {
  name: string;
  callback: () => void;
  keyCondition: (e: KeyboardEvent) => boolean;
};

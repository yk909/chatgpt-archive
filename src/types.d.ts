type Conversation = {
  id: string;
  title: string;
  current_node: string | null;
  mapping: null;
  update_time: string;
  create_time: string;
  messageStr: string | undefined;
  messages: Message[] | undefined;
};

type Message = {
  id: string;
  conversationId: string;
  content: string;
  create_time: string;
  update_time: string;
  folderId: string | null;
};

type FetchFilteredConversationData = {
  title: string;
};

type FolderCreationData = {
  name: string;
  color?: string;
  children: string[];
};

type FolderWithoutChildren = {
  id: string;
  update_time: string;
  create_time: string;
} & Omit<FolderCreationData, "children">;

type Folder = FolderWithoutChildren & {
  children: Conversation[];
};

type MessageHandler = (request: any, sender, sendResponse) => void;

type KeyboardShortcutItem = {
  name: string;
  callback: () => void;
  keyCondition: (e: KeyboardEvent) => boolean;
};

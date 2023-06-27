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

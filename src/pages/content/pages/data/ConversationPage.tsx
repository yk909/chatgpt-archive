import { MESSAGE_ACTIONS } from "@src/constants";
import { conversationListAtom } from "@src/pages/content/context";
import { List as ConversationList } from "@src/pages/content/components/Conversation";
import { fetchMoreConversations } from "@src/pages/content/messages";
import { ListView } from "@src/pages/content/components/ListView";

export function ConversationPage() {
  return (
    <ListView
      dataAtom={conversationListAtom}
      fetchMore={fetchMoreConversations}
      fetch_message_type={MESSAGE_ACTIONS.FETCH_CONVERSATIONS}
      append_message_type={MESSAGE_ACTIONS.APPEND_CONVERSATIONS}
      renderData={({ data, selection, toggle }) => (
        <ConversationList
          data={data}
          selectionEnabled={selection.size !== 0}
          toggle={toggle}
          selection={selection}
        />
      )}
      id="con-list"
    />
  );
}

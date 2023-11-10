import { TabsContent } from "@src/components/ui/tabs";
import { ConversationItem } from "../ConversationItem";
import { EmptyResult } from "../EmptyResult";
import { CommandList } from "@src/components/ui/command";

export default function ConversationTabContent({
  conversations,
  handleConversationSelect,
}: {
  conversations: (Conversation & { keywordCount: number })[];
  handleConversationSelect: (id: string) => void;
}) {
  return (
    <TabsContent
      value="conversations"
      className="px-2 py-1 min-h-0 flex-1 overflow-scroll"
    >
      <CommandList>
        {conversations && conversations.length !== 0 ? (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              onSelect={() => {
                handleConversationSelect(conversation.id);
              }}
            />
          ))
        ) : (
          <EmptyResult name="conversation" />
        )}
      </CommandList>
    </TabsContent>
  );
}

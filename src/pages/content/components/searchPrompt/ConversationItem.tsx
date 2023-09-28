import { CommandItem } from "@src/components/ui/command";
import { Conversation } from "@src/types";
import { MessageIcon } from "@src/components/Icon";

export function ConversationItem({
  conversation,
  onSelect,
}: {
  conversation: Conversation;
  onSelect: () => void;
}) {
  return (
    <CommandItem
      key={conversation.id}
      value={conversation.id}
      onSelect={onSelect}
    >
      <MessageIcon size="sm" />
      <span className="flex-1 min-w-0 truncate">{conversation.title}</span>
    </CommandItem>
  );
}

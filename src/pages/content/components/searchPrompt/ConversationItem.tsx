import { CommandItem } from "@src/components/ui/command";
import { MessageIcon } from "@src/components/Icon";

export function ConversationItem({
  conversation,
  onSelect,
}: {
  conversation: Conversation & { keywordCount: number };
  onSelect: () => void;
}) {
  console.log("render conversation item", { conversation });
  return (
    <CommandItem
      key={conversation.id}
      value={conversation.id}
      onSelect={onSelect}
    >
      <MessageIcon size="sm" />
      <span className="flex-1 inline-block min-w-0 truncate">
        {conversation.title}
      </span>
      <div className="flex items-center flex-none gap-3">
        <span className="inline-block text-green-600 text-bold">
          {conversation.keywordCount}
        </span>
      </div>
    </CommandItem>
  );
}

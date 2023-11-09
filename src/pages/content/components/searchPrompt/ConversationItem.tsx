import { CommandItem } from "@src/components/ui/command";
import { MessageIcon } from "@src/components/Icon";

export function ConversationItem({
  conversation,
  onSelect,
}: {
  conversation: Conversation & { keywordCount: number };
  onSelect: () => void;
}) {
  return (
    <CommandItem
      key={conversation.id}
      value={conversation.id}
      onSelect={onSelect}
    >
      <div className="flex items-center mx-2 w-full cursor-pointer">
        <MessageIcon size="sm" />
        <span className="flex-1 inline-block min-w-0 truncate">
          {conversation.title}
        </span>
        <div className="flex items-center flex-none gap-3">
          <span className="inline-block text-green-500 font-semibold">
            {conversation.keywordCount}
          </span>
        </div>
      </div>
    </CommandItem>
  );
}

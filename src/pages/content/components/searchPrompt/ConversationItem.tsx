import { CommandItem } from "@src/components/ui/command";
import { MessageIcon, MessageIconWithSelection } from "@src/components/Icon";
import { MoreDropdownButton } from "../MoreDropdownButton";
import { AddToFolderDropdown } from "../actions/AddToFolderDropdown";

export function ConversationItem({
  conversation,
  onSelect,
  selected,
  toggle,
  selectionEnabled,
}: {
  conversation: Conversation & { keywordCount: number };
  onSelect: () => void;
  selected?: boolean;
  toggle?: (id: string) => void;
  selectionEnabled?: boolean;
}) {
  const handleToggle = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    toggle(conversation.id);
  };
  return (
    <CommandItem
      style={{
        padding: "8px 16px",
      }}
      key={conversation.id}
      value={conversation.id}
      onSelect={onSelect}
      className="card"
    >
      <div className="flex items-center w-full cursor-pointer">
        <MessageIconWithSelection
          size="sm"
          selected={selected}
          enabled={!!toggle && !!selected && selectionEnabled}
          id={"c-" + conversation.id}
          handleToggle={handleToggle}
        />
        {/* <MessageIcon size="sm" /> */}
        <span className="ml-2 flex-1 inline-block min-w-0 truncate">
          {conversation.title}
        </span>
        <div className="flex items-center flex-none gap-3">
          <MoreDropdownButton
            triggerClassName="opacity-0 card-hover-show"
            items={
              <>
                <AddToFolderDropdown conversationIdList={[conversation.id]} />
              </>
            }
          />
          <span className="inline-block text-green-500 font-semibold">
            {conversation.keywordCount}
          </span>
        </div>
      </div>
    </CommandItem>
  );
}

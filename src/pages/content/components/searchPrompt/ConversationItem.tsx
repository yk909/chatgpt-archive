import { CommandItem } from "@src/components/ui/command";
import { MessageIcon, MessageIconWithSelection } from "@src/components/Icon";
import { MoreDropdownButton } from "../MoreDropdownButton";
import { AddToFolderDropdown } from "../actions/AddToFolderDropdown";
import { loadConversation } from "@src/utils";
import { useConversation } from "../../hook";

export function ConversationItem({
  conversation,
  onSelect,
  selected,
  toggle,
  selectionEnabled,
}: {
  conversation: Conversation & { keywordCount?: number };
  onSelect?: () => void;
  selected?: boolean;
  toggle?: (id: string) => void;
  selectionEnabled?: boolean;
}) {
  const handleToggle = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    toggle(conversation.id);
  };
  // const { pinned, active } = useConversation(conversation.id);
  return (
    <div
      style={{
        padding: "8px 16px",
      }}
      className="card text-sm cursor-default"
      onClick={(e) => {
        console.log("click conversation item");
      }}
    >
      <div className="flex items-center w-full">
        <MessageIconWithSelection
          size="sm"
          selected={selected}
          enabled={!!toggle && !!selected && selectionEnabled}
          id={"c-" + conversation.id}
          handleToggle={handleToggle}
        />
        {/* <MessageIcon size="sm" /> */}
        <div
          className="ml-2 flex-1 inline-block min-w-0 truncate cursor-pointer"
          onClick={() => {
            loadConversation(conversation.id);
          }}
        >
          {conversation.title}
        </div>
        <div className="flex items-center flex-none gap-3">
          <MoreDropdownButton
            triggerClassName="opacity-0 card-hover-show"
            items={
              <>
                <AddToFolderDropdown conversationIdList={[conversation.id]} />
              </>
            }
          />
          {!!conversation.keywordCount && (
            <span className="inline-block text-green-500 font-semibold">
              {conversation.keywordCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

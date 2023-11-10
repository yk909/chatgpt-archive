import { formatDates, loadConversation } from "@src/utils";
import { MessageSquare } from "lucide-react";
import { Checkbox } from "@src/components/ui/checkbox";
import {
  ConversationMoreDropdownButton,
  MoreDropdownButton,
} from "./MoreDropdownButton";
import { AddToFolderDropdown } from "./dropdown/AddToFolderDropdown";

export function ConversationCard({
  data,
  selected,
  toggle,
  selectionEnabled,
  noSelect = false,
}: {
  data: Conversation;
  selected?: boolean;
  toggle?: (id: string) => void;
  selectionEnabled?: boolean;
  noSelect?: boolean;
}) {
  const active = false;
  const handleToggle = (e: any) => {
    e.stopPropagation();
    toggle(data.id);
  };
  return (
    <div className={"flex gap-3 card " + (active ? "bg-dark-1" : "")}>
      <div className="flex flex-none fcenter">
        {noSelect ? (
          <MessageSquare size={20} className="trans" />
        ) : !selectionEnabled ? (
          <div className="relative group fcenter">
            <Checkbox
              id={"c-" + data.id}
              checked={selected}
              className="relative z-10 opacity-0 group-hover:opacity-100"
              onClick={handleToggle}
            />
            <MessageSquare
              size={20}
              className="absolute group-hover:opacity-0 trans"
            />
          </div>
        ) : (
          <Checkbox
            id={"c-" + data.id}
            checked={selected}
            onClick={handleToggle}
          />
        )}
      </div>
      <div
        className="flex-col flex-1 min-w-0 gap-1 cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          loadConversation(data.id);
        }}
      >
        <div
          className="text-sm truncate"
          dangerouslySetInnerHTML={{ __html: data.title }}
        ></div>
        <div className="text-xs text-muted-foreground">
          Last update: {formatDates(data.update_time)}
        </div>
        {/* <div className="text-xs text-muted-foreground">
          Create time: {formatDates(data.create_time)}
        </div> */}
      </div>

      <div className="flex items-center flex-none gap-1">
        <MoreDropdownButton
          triggerClassName="opacity-0 card-hover-show"
          items={
            <>
              <AddToFolderDropdown conversationIdList={[data.id]} />
            </>
          }
        />
      </div>
    </div>
  );
}

export function List({
  data,
  selection,
  toggle,
  selectionEnabled,
}: {
  data: Conversation[];
  selection: Set<string>;
  toggle: (id: string) => void;
  selectionEnabled: boolean;
}) {
  return (
    <div className="flex flex-col w-full">
      {data.map((item) => (
        <ConversationCard
          key={item.id}
          data={item}
          selected={selection.has(item.id)}
          toggle={toggle}
          selectionEnabled={selectionEnabled}
        />
      ))}
    </div>
  );
}

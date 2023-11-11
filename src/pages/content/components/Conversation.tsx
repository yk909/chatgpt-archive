import { formatDates, loadConversation } from "@src/utils";
import { MessageSquare } from "lucide-react";
import { Checkbox } from "@src/components/ui/checkbox";
import {
  ConversationMoreDropdownButton,
  MoreDropdownButton,
} from "./MoreDropdownButton";
import { AddToFolderDropdown } from "./actions/AddToFolderDropdown";
import { MessageIconWithSelection, PinIcon } from "@src/components/Icon";
import {
  TogglePinConversationButton,
  TogglePinConversationDropdown,
} from "./actions/TogglePinConversation";
import { useAtom } from "jotai";
import { pinConversationIdSetAtom } from "../context";
import { cn } from "@src/lib/utils";

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
  const [pinSet, _] = useAtom(pinConversationIdSetAtom);
  const pinned = pinSet.has(data.id);
  const active = false;
  const handleToggle = (e: any) => {
    e.stopPropagation();
    toggle(data.id);
  };
  console.count("render ConversationCard");
  return (
    <div
      className={cn(
        "flex gap-3 card ",
        active ? "bg-dark-1" : "",
        pinned && "border border-yellow-500"
      )}
    >
      <div className="flex flex-none fcenter">
        {noSelect ? (
          <MessageSquare size={20} className="trans" />
        ) : (
          <MessageIconWithSelection
            selected={selected}
            enabled={selectionEnabled}
            id={"c-" + data.id}
            handleToggle={handleToggle}
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

      <div className="flex items-center flex-none gap-2">
        <TogglePinConversationButton
          conversationId={data.id}
          className="opacity-0 card-hover-show"
        />
        <MoreDropdownButton
          triggerClassName="opacity-0 card-hover-show"
          items={
            <>
              <AddToFolderDropdown conversationIdList={[data.id]} />
              <TogglePinConversationDropdown conversationId={data.id} />
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
    <div className="flex flex-col w-full gap-2">
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

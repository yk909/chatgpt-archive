import { useAtom } from "jotai";
import { pinConversationListAtom } from "../context";
import { MessageSquare } from "lucide-react";
import { formatDates, loadConversation } from "@src/utils";
import { MoreDropdownButton } from "./MoreDropdownButton";
import { AddToFolderDropdown } from "./actions/AddToFolderDropdown";
import { TogglePinConversationDropdown } from "./actions/TogglePinConversation";
import { togglePinConversation } from "../messages";
import { PinIcon } from "@src/components/Icon";
import {
  ConversationDetailPopover,
  ConversationDetailPopoverDropdown,
} from "@src/components/ConversationDetailPopover";

function PinConversation({ data }: { data: Conversation }) {
  const active = false;
  return (
    <div
      className={
        "flex card items-center border border-green-500" +
        (active ? "bg-dark-1" : "")
      }
      style={{
        paddingTop: "8px",
        paddingBottom: "8px",
      }}
    >
      <MessageSquare size={18} className="mr-2 trans" />
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
        {/* <div className="text-xs text-muted-foreground">
          Last update: {formatDates(data.update_time)}
        </div> */}
        {/* <div className="text-xs text-muted-foreground">
          Create time: {formatDates(data.create_time)}
        </div> */}
      </div>

      <div className="flex items-center flex-none gap-1">
        <ConversationDetailPopover
          conversation={data}
          className="opacity-0 card-hover-show icon-container icon-container-sm"
        />
        <div className="opacity-0 card-hover-show icon-container icon-container-sm">
          <PinIcon
            pinned={true}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              togglePinConversation(data.id);
            }}
          />
        </div>
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
export function PinConversationList() {
  const [pinConversations, _] = useAtom(pinConversationListAtom);

  return (
    <div className="flex flex-col gap-2 mb-3">
      {/* <div className="flex items-center mx-3 mb-2 text-sm">
        <Pin className="mr-2 text-yellow-500 " size={20} />
        <div>Pinned conversations</div>
      </div> */}
      {pinConversations.map((c) => (
        <PinConversation key={c.id} data={c} />
      ))}
    </div>
  );
}

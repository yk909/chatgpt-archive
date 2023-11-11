import { useAtom } from "jotai";
import { pinConversationListAtom } from "../context";
import { MessageSquare, Pin } from "lucide-react";
import { formatDates, loadConversation } from "@src/utils";
import { MoreDropdownButton } from "./MoreDropdownButton";
import { AddToFolderDropdown } from "./dropdown/AddToFolderDropdown";
import { TogglePinConversationDropdown } from "./dropdown/TogglePinConversation";
import { togglePinConversation } from "../messages";
import { PinIcon } from "@src/components/Icon";

function PinConversation({ data }) {
  const active = false;
  return (
    <div
      className={
        "flex card items-center border border-primary" +
        (active ? "bg-dark-1" : "")
      }
      style={{
        paddingTop: "10px",
        paddingBottom: "10px",
      }}
    >
      <MessageSquare size={18} className="trans mr-2" />
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
        <MoreDropdownButton
          triggerClassName="opacity-0 card-hover-show"
          items={
            <>
              <AddToFolderDropdown conversationIdList={[data.id]} />
              <TogglePinConversationDropdown conversationId={data.id} />
            </>
          }
        />
        <PinIcon
          pinned={true}
          size="sm"
          className="opacity-0 card-hover-show"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            togglePinConversation(data.id);
          }}
        />
      </div>
    </div>
  );
}
export function PinConversationList() {
  const [pinConversations, setPinConversations] = useAtom(
    pinConversationListAtom
  );

  return (
    <div className="flex flex-col gap-2 mb-3">
      {/* <div className="mb-2 flex text-sm items-center mx-3">
        <Pin className="text-yellow-500 mr-2 " size={20} />
        <div>Pinned conversations</div>
      </div> */}
      {pinConversations.map((c) => (
        <PinConversation key={c.id} data={c} />
      ))}
    </div>
  );
}

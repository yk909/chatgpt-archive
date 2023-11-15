import { useAtom } from "jotai";
import { pinConversationListAtom } from "../context";
import { ConversationItemWithoutSelect } from "../pages/data/ConversationPage/Conversation";

export function PinConversationList() {
  const [pinConversations, _] = useAtom(pinConversationListAtom);

  return (
    <div className="flex flex-col gap-2 mb-3">
      {/* <div className="flex items-center mx-3 mb-2 text-sm">
        <Pin className="mr-2 text-yellow-500 " size={20} />
        <div>Pinned conversations</div>
      </div> */}
      {pinConversations.map((c) => (
        <ConversationItemWithoutSelect key={c.id} conversation={c} />
      ))}
    </div>
  );
}

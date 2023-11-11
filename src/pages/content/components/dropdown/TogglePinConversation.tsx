import { DropdownMenuItem } from "@src/components/ui/dropdown-menu";
import { useAtom } from "jotai";
import { pinConversationIdSetAtom } from "../../context";
import { Pin, PinOff } from "lucide-react";
import { togglePinConversation } from "../../messages";
import { PinIcon } from "@src/components/Icon";

export function TogglePinConversationDropdown({
  conversationId,
}: {
  conversationId: string;
}) {
  const [pinSet, _] = useAtom(pinConversationIdSetAtom);
  const pinned = pinSet.has(conversationId);
  return (
    <DropdownMenuItem
      onSelect={() => {
        togglePinConversation(conversationId);
      }}
    >
      <PinIcon pinned={pinned} className="icon-dropdown-menu-item" size="sm" />
      {pinned ? "Unpin conversation" : "Pin conversation"}
    </DropdownMenuItem>
  );
}

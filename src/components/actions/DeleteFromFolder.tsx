import { DeleteIcon } from "@src/components/Icon";
import { DropdownMenuItem } from "@src/components/ui/dropdown-menu";
import { deleteConversationsFromFolder } from "@src/pages/content/messages";

export function DeleteFromFolderDropdown({
  folderId,
  conversationId,
}: {
  folderId: string;
  conversationId: string;
}) {
  return (
    <DropdownMenuItem
      onSelect={() => {
        console.log("delete from folder");
        deleteConversationsFromFolder([conversationId], folderId);
      }}
    >
      <DeleteIcon className="icon-dropdown-menu-item" size="sm" />
      <span>Delete from folder</span>
    </DropdownMenuItem>
  );
}

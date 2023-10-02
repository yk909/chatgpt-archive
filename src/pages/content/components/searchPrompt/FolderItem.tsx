import { CommandItem } from "@src/components/ui/command";
import { MessageIcon, ToggleIcon } from "@src/components/Icon";
import { Folder } from "@src/types";
import { FolderInfo } from "../Folder";

export function FolderItem({
  folder,
  onSelect,
}: {
  folder: Folder;
  onSelect: () => void;
}) {
  return (
    <CommandItem value={folder.id} onSelect={onSelect}>
      <MessageIcon size="sm" />
      <FolderInfo folder={folder} />
      <div className="flex items-center flex-none gap-1">
        {/* <FolderMoreButton folderId={data.id} /> */}
        {/* <ToggleIcon onClick={handleOpenToggle} open={open} /> */}
      </div>
    </CommandItem>
  );
}

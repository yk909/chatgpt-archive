import { CommandItem } from "@src/components/ui/command";
import { MessageIcon } from "@src/components/Icon";
import { Folder } from "@src/types";

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
      <span className="flex-1 min-w-0 truncate">{folder.name}</span>
    </CommandItem>
  );
}

import { CommandItem } from "@src/components/ui/command";
import { MessageIcon, ToggleIcon } from "@src/components/Icon";
import { Folder } from "@src/types";
import { FolderInfo } from "../Folder";
import { ConversationCard } from "../Conversation";
import React from "react";

export function FolderItem({
  folder,
  onSelect,
}: {
  folder: Folder;
  onSelect: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const handleOpenToggle = () => setOpen((prev) => !prev);
  return (
    <CommandItem
      value={folder.id}
      onSelect={onSelect}
      className="flex flex-col items-stretch"
    >
      <div className="flex items-center">
        <MessageIcon size="sm" />
        <FolderInfo folder={folder} />
        <div className="flex items-center flex-none gap-1">
          {/* <FolderMoreButton folderId={data.id} /> */}
          <ToggleIcon onClick={handleOpenToggle} open={open} />
        </div>
      </div>
      <div
        className="w-full animate-dynamic-h-container"
        data-open={open ? "true" : "false"}
      >
        <div className="flex flex-col ml-8 animate-dynamic-h-content">
          {folder.children.map((item) => (
            <ConversationCard key={item.id} data={item} noSelect={true} />
          ))}
        </div>
      </div>
    </CommandItem>
  );
}

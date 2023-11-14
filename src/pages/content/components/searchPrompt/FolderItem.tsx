import { CommandItem } from "@src/components/ui/command";
import { MessageIcon, ToggleIcon } from "@src/components/Icon";
import { FolderInfo } from "../Folder";
import { ConversationCard } from "../Conversation";
import React from "react";
import { Folder } from "lucide-react";
import { ConversationItem } from "./ConversationItem";

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
    <div
      style={{
        padding: 0,
      }}
    >
      <div
        onClick={() => onSelect()}
        style={{
          padding: "8px 16px",
        }}
        className="flex flex-col items-stretch text-sm card"
      >
        <div className="flex items-center w-full">
          {/* <MessageIcon size="sm" /> */}
          <Folder size={16} className="mr-2" />
          <FolderInfo folder={folder} />
          <div className="flex items-center flex-none gap-1">
            {/* <FolderMoreButton folderId={data.id} /> */}
            <ToggleIcon onClick={handleOpenToggle} open={open} />
          </div>
        </div>
      </div>

      <div
        className="w-full animate-dynamic-h-container"
        data-open={open ? "true" : "false"}
      >
        <div className="flex flex-col ml-6 animate-dynamic-h-content">
          {folder.children.map((item) => (
            // <ConversationCard key={item.id} data={item} noSelect={true} />
            <ConversationItem key={item.id} conversation={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

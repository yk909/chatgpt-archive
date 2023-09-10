import { useState } from "react";
import { formatDates, loadConversation } from "@src/utils";
import { type Conversation, type Folder } from "@src/types";
import { Checkbox } from "@src/components/ui/checkbox";
import {
  ChevronRight,
  Folder as FolderIcon,
  FolderEdit,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@src/components/ui/dropdown-menu";

type ItemType = "folder" | "conversation";

function MoreDropdownMenu({ folderId }: { folderId: string }) {
  return (
    <DropdownMenuContent className="w-[200px]" align="end">
      <DropdownMenuItem>
        <FolderEdit className="icon-dropdown-menu-item" />
        <span>
          Rename
        </span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

function FolderMoreButton({ folderId }: { folderId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className="icon-container icon-container-sm card-hover-show opacity-0">
          <MoreHorizontal
            style={{
              width: 20,
              height: 20,
            }}
          />
        </div>
      </DropdownMenuTrigger>
      {open && <MoreDropdownMenu folderId={folderId} />}
    </DropdownMenu>
  );
}

function ConversationItem({
  data,
  selectionEnabled,
  selected,
  toggle,
}: {
  data: Conversation;
  selectionEnabled: boolean;
  selected: boolean;
  toggle: (id: string) => void;
}) {
  const handleToggle = (e: any) => {
    e.stopPropagation();
    toggle(data.id);
  };
  return (
    <div className="flex flex-col relative">
      <div className="card flex items-center gap-3">
        <div className="flex-none">
          {!selectionEnabled
            ? (
              <div className="relative group fcenter">
                <Checkbox
                  id={"f-" + data.id}
                  checked={selected}
                  className="relative z-10 opacity-0 group-hover:opacity-100"
                  onClick={handleToggle}
                />
                <MessageSquare
                  size={20}
                  className="absolute group-hover:opacity-0 trans"
                />
              </div>
            )
            : (
              <Checkbox
                id={"f-" + data.id}
                checked={selected}
                onClick={handleToggle}
              />
            )}
        </div>
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => {
            loadConversation(data.id);
          }}
        >
          <div className="text-sm">
            {data.title}
          </div>
          <div className="text-xs text-gray-400">
            Last update: {formatDates(data.update_time)}
          </div>
        </div>

        <div className="flex-none flex items-center gap-1">
        </div>
      </div>
    </div>
  );
}

function FolderItem({
  data,
  selection,
  selectionEnabled,
  selected,
  toggle,
}: {
  data: Folder;
  selection: Set<string>;
  selectionEnabled: boolean;
  selected: boolean;
  toggle: (id: string) => void;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const handleToggle = (e: any) => {
    e.stopPropagation();
    toggle(data.id);
  };
  const handleOpenToggle = () => {
    setOpen((p) => !p);
  };
  return (
    <div className="flex flex-col relative">
      <div className="card flex items-center gap-3">
        <div className="flex-none">
          {!selectionEnabled
            ? (
              <div className="relative group fcenter">
                <Checkbox
                  id={"f-" + data.id}
                  checked={selected}
                  className="relative z-10 opacity-0 group-hover:opacity-100"
                  onClick={handleToggle}
                />
                <FolderIcon
                  size={20}
                  className="absolute group-hover:opacity-0 trans"
                />
              </div>
            )
            : (
              <Checkbox
                id={"f-" + data.id}
                checked={selected}
                onClick={handleToggle}
              />
            )}
        </div>
        <div className="flex-1 min-w-0 cursor-pointer">
          <div className="text-sm">
            {data.name}
          </div>
          <div className="text-xs text-gray-400">
            {`${data.children.length} items`}
          </div>
        </div>

        <div className="flex-none flex items-center gap-1">
          <FolderMoreButton folderId={data.id} />
          <div
            className="icon-container icon-container-sm transition-transform"
            onClick={handleOpenToggle}
            style={{
              transform: open ? "rotate(90deg)" : "",
            }}
          >
            <ChevronRight
              style={{
                width: 20,
                height: 20,
              }}
            />
          </div>
        </div>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 0.3s",
        }}
      >
        <div className="grid ml-8 overflow-hidden">
          {data.children.map((item) => (
            <ConversationItem
              key={item.id}
              data={item}
              selected={selection.has(item.id)}
              toggle={toggle}
              selectionEnabled={selectionEnabled}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FolderList({
  data,
  selection,
  toggle,
  selectionEnabled,
}: {
  data: Folder[];
  selection: Set<string>;
  toggle: (id: string) => void;
  selectionEnabled: boolean;
}) {
  return (
    <div className="flex flex-col w-full">
      {data.map((item) => (
        <FolderItem
          key={item.id}
          data={item}
          selection={selection}
          selected={selection.has(item.id)}
          toggle={toggle}
          selectionEnabled={selectionEnabled}
        />
      ))}
    </div>
  );
}

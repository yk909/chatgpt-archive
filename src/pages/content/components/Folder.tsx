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
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@src/components/ui/dropdown-menu";
import { useAtom } from "jotai";
import { bgResponseStatusAtom } from "@src/pages/content/context";
import { ConversationCard } from "./Conversation";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@src/components/ui/dialog";
import { DialogForm } from "@src/components/DialogForm";
import { useEffect } from "react";
import { deleteFolder, renameFolder } from "../messages";
import { ToggleIcon } from "@src/components/Icon";

function FolderMoreButton({ folderId }: { folderId: string }) {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useAtom(bgResponseStatusAtom);

  const OptionInputsMap = {
    rename: {
      title: "Rename folder",
      inputs: [
        {
          label: "New Name",
          name: "name",
          type: "text",
          placeholder: "Enter a new name",
        },
      ],
      onSubmit: (data: any) => {
        console.log(`rename folder ${folderId}`, data);
        renameFolder(folderId, data.name);
      },
    },
  };

  useEffect(() => {
    if (selectedOption) {
      console.log("setting dialog open to true");
      setDialogOpen(true);
    }
  }, [selectedOption]);

  useEffect(() => {
    if (dialogOpen && responseStatus.status === "SUCCESS") {
      setDialogOpen(false);
      setSelectedOption(null);
    }
  }, [responseStatus, dialogOpen]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <div className="opacity-0 icon-container icon-container-sm card-hover-show">
            <MoreHorizontal
              style={{
                width: 20,
                height: 20,
              }}
            />
          </div>
        </DropdownMenuTrigger>
        {/* {open && <MoreDropdownMenu folderId={folderId} />} */}
        {open && (
          <DropdownMenuContent className="w-[200px]" align="end">
            <DropdownMenuItem
              onClick={() => {
                console.log("click rename dropdown menu item");
                setSelectedOption("rename");
              }}
            >
              <DialogTrigger asChild>
                <div className="flex items-center">
                  <FolderEdit className="icon-dropdown-menu-item" />
                  <span>Rename</span>
                </div>
              </DialogTrigger>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                deleteFolder([folderId]);
              }}
            >
              <div className="flex items-center text-red-500">
                <Trash2 className="icon-dropdown-menu-item" />
                <span>Delete</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
        {dialogOpen && (
          <DialogForm {...OptionInputsMap[selectedOption]} setOpen={setOpen} />
        )}
      </DropdownMenu>
    </Dialog>
  );
}

export function FolderInfo({ folder }: { folder: Folder }) {
  return (
    <div className="flex-1 min-w-0 cursor-pointer">
      <div className="text-sm">{folder.name}</div>
      <div className="text-xs text-gray-400">
        {`${folder.children.length} items`}
      </div>
    </div>
  );
}

export function FolderItem({
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
    <div className="relative flex flex-col flex-1 min-w-0">
      <div className="flex items-center gap-3 card">
        <div className="flex-none">
          {!selectionEnabled ? (
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
          ) : (
            <Checkbox
              id={"f-" + data.id}
              checked={selected}
              onClick={handleToggle}
            />
          )}
        </div>
        <FolderInfo folder={data} />

        <div className="flex items-center flex-none gap-1">
          <FolderMoreButton folderId={data.id} />
          <ToggleIcon onClick={handleOpenToggle} open={open} />
        </div>
      </div>

      <div
        className="animate-dynamic-h-container"
        data-open={open ? "true" : "false"}
      >
        <div className="flex flex-col ml-8 animate-dynamic-h-content">
          {data.children.map((item) => (
            <ConversationCard
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

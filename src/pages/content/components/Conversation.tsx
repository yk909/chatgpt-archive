import { Conversation } from "@src/types";
import { formatDates, loadConversation } from "@src/utils";
import {
  Check,
  FolderInput,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";
import { Checkbox } from "@src/components/ui/checkbox";
import { bgResponseStatusAtom, folderListAtom } from "../context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@src/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@src/components/ui/command";
import { useAtom } from "jotai";
import { addConversationToFolder, fetchMoreFolders } from "../messages";

function MoreDropdown({
  conversationId,
  setOpen,
}: {
  conversationId: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [folders] = useAtom(folderListAtom);
  const [responseStatus, setResponseStatus] = useAtom(bgResponseStatusAtom);

  useEffect(() => {
    if (responseStatus.status) {
      console.log("Receive response", responseStatus);
      setOpen(false);
      setResponseStatus({});
    }
  }, [responseStatus]);

  const handleAddToFolder = (folderId: string) => {
    addConversationToFolder(conversationId, folderId);
  };

  console.log("render more dorpdownn");

  return (
    <DropdownMenuContent className="w-[200px]" align="end">
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <FolderInput className="icon-dropdown-menu-item" />
          <span>Add to folder</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="p-0">
          <Command>
            <CommandInput placeholder="Choose a folder" autoFocus />
            <CommandList>
              <CommandEmpty>No folders found</CommandEmpty>
              <CommandGroup>
                {folders.map((f, i) => {
                  const alreadyAdded = f.children
                    .map((c) => c.id)
                    .includes(conversationId);
                  return (
                    <CommandItem
                      key={i}
                      disabled={alreadyAdded}
                      className={
                        "flex items-center justify-between" +
                        (alreadyAdded ? " opacity-50" : "")
                      }
                      onSelect={() => {
                        handleAddToFolder(f.id);
                      }}
                    >
                      {f.name}
                      {alreadyAdded && <Check className={"w-4 h-4"} />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuContent>
  );
}

function MoreDropdownButton({ conversationId }: { conversationId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <div className="opacity-0 icon-container icon-container-sm card-hover-show">
          <MoreHorizontal
            style={{
              width: 20,
              height: 20,
            }}
          />
        </div>
      </DropdownMenuTrigger>
      {open && (
        <MoreDropdown conversationId={conversationId} setOpen={setOpen} />
      )}
    </DropdownMenu>
  );
}

export function ConversationCard({
  data,
  selected,
  toggle,
  selectionEnabled,
  noSelect = false,
}: {
  data: Conversation;
  selected?: boolean;
  toggle?: (id: string) => void;
  selectionEnabled?: boolean;
  noSelect?: boolean;
}) {
  const active = false;
  const handleToggle = (e: any) => {
    e.stopPropagation();
    toggle(data.id);
  };
  return (
    <div className={"flex gap-3 card " + (active ? "bg-dark-1" : "")}>
      <div className="flex flex-none fcenter">
        {noSelect ? (
          <MessageSquare size={20} className="trans" />
        ) : !selectionEnabled ? (
          <div className="relative group fcenter">
            <Checkbox
              id={"c-" + data.id}
              checked={selected}
              className="relative z-10 opacity-0 group-hover:opacity-100"
              onClick={handleToggle}
            />
            <MessageSquare
              size={20}
              className="absolute group-hover:opacity-0 trans"
            />
          </div>
        ) : (
          <Checkbox
            id={"c-" + data.id}
            checked={selected}
            onClick={handleToggle}
          />
        )}
      </div>
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

      <div className="flex items-center flex-none gap-1">
        <MoreDropdownButton conversationId={data.id} />
      </div>
    </div>
  );
}

export function List({
  data,
  selection,
  toggle,
  selectionEnabled,
}: {
  data: Conversation[];
  selection: Set<string>;
  toggle: (id: string) => void;
  selectionEnabled: boolean;
}) {
  return (
    <div className="flex flex-col w-full">
      {data.map((item) => (
        <ConversationCard
          key={item.id}
          data={item}
          selected={selection.has(item.id)}
          toggle={toggle}
          selectionEnabled={selectionEnabled}
        />
      ))}
    </div>
  );
}

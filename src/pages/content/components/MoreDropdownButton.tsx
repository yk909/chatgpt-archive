import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { bgResponseStatusAtom } from "../context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@src/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { AddToFolderDropdown } from "./dropdown/AddToFolderDropdown";
import { cn } from "@src/lib/utils";

function ConversationDropdownContent({
  setOpen,
  children,
  ...props
}: {
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
} & React.ComponentProps<typeof DropdownMenuContent>) {
  const [responseStatus, setResponseStatus] = useAtom(bgResponseStatusAtom);

  useEffect(() => {
    if (responseStatus.status) {
      console.log("Receive response", responseStatus);
      setOpen(false);
      setResponseStatus({});
    }
  }, [responseStatus]);

  return <DropdownMenuContent {...props}>{children}</DropdownMenuContent>;
}

export function MoreDropdownButton({
  triggerClassName = "",
  contentProps = {
    align: "end",
    className: "w-[200px]",
  },
  items,
}: {
  triggerClassName?: string;
  contentProps?: React.ComponentProps<typeof DropdownMenuContent>;
  items: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  console.log("render MoreDropdownButton");

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <div
          className={cn(
            "icon-container icon-container-sm text-foreground",
            triggerClassName
          )}
        >
          <MoreHorizontal
            style={{
              width: 20,
              height: 20,
            }}
          />
        </div>
      </DropdownMenuTrigger>
      {open && (
        <ConversationDropdownContent setOpen={setOpen} {...contentProps}>
          {items}
        </ConversationDropdownContent>
      )}
    </DropdownMenu>
  );
}

export function ConversationMoreDropdownButton({
  conversationIdList,
  triggerClassName = "",
  contentProps = {
    align: "end",
    className: "w-[200px]",
  },
}: {
  conversationIdList: string[];
  triggerClassName?: string;
  contentProps?: React.ComponentProps<typeof DropdownMenuContent>;
}) {
  const [open, setOpen] = useState(false);

  console.log("render MoreDropdownButton");

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <div
          className={cn(
            "icon-container icon-container-sm text-foreground",
            triggerClassName
          )}
        >
          <MoreHorizontal
            style={{
              width: 20,
              height: 20,
            }}
          />
        </div>
      </DropdownMenuTrigger>
      {open && (
        <ConversationDropdownContent setOpen={setOpen} {...contentProps}>
          <AddToFolderDropdown conversationIdList={conversationIdList} />
        </ConversationDropdownContent>
      )}
    </DropdownMenu>
  );
}

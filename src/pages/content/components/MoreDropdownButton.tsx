import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { bgResponseStatusAtom } from "../context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@src/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { AddToFolderDropdown } from "../../../components/actions/AddToFolder";
import { cn } from "@src/lib/utils";
import { MoreIcon } from "@src/components/Icon";

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
  size = "sm",
  contentProps = {
    align: "end",
    className: "w-[200px]",
  },
  children,
}: {
  triggerClassName?: string;
  size?: IconSize;
  contentProps?: React.ComponentProps<typeof DropdownMenuContent>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  // console.log("render MoreDropdownButton");

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <div
          className={cn(
            `icon-container icon-container-${size} text-foreground`,
            triggerClassName
          )}
        >
          <MoreIcon size={size} />
        </div>
      </DropdownMenuTrigger>
      {open && (
        <ConversationDropdownContent setOpen={setOpen} {...contentProps}>
          {children}
        </ConversationDropdownContent>
      )}
    </DropdownMenu>
  );
}

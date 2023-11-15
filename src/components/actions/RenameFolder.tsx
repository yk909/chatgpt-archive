import { RenameFolderIcon } from "../Icon";
import { useAtom } from "jotai";
import { globalDialogAtom } from "@src/pages/content/context";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { DropdownMenuItem } from "@src/components/ui/dropdown-menu";
import { useEffect, useRef } from "react";

const duration = 200;

export function RenameFolderDropdown({ folderId }: { folderId: string }) {
  const [dialogOpen, setDialogOpen] = useAtom(globalDialogAtom);
  console.log("render RenameFolderDropdown", { dialogOpen });
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger>
        <DropdownMenuItem>
          <RenameFolderIcon className="icon-dropdown-menu-item" />
          <span>Rename folder</span>
        </DropdownMenuItem>
      </DialogTrigger>
      {open && <DialogContent>Hello World</DialogContent>}
    </Dialog>
  );
}

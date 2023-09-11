import React, { useEffect, useState } from "react";
import { ListView } from "@src/pages/content/components/ListView";
import { bgResponseStatusAtom, folderListAtom } from "../../context";
import { MESSAGE_ACTIONS } from "@src/constants";
import { FolderList } from "@src/pages/content/components/Folder";
import { createNewFolder, fetchMoreFolders } from "../../messages";
import { Plus } from "lucide-react";
import { Button } from "@src/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@src/components/ui/dialog";
import { DialogForm } from "@src/components/DialogForm";
import { useAtom } from "jotai";

type CreateNewFolderForm = {
  name: string;
  color?: string;
};

function CreateNewFolderButton() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [responseStatus, setResponseStatus] = useAtom(bgResponseStatusAtom);

  const onSubmit = (data: CreateNewFolderForm) => {
    console.log("submit form", data);
    setLoading(() => true);
    createNewFolder({ ...data, children: [] });
  };

  useEffect(() => {
    if (open && responseStatus.status === "SUCCESS") {
      setOpen(false);
    }
  }, [responseStatus]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="icon-container icon-container-md">
          <Plus />
        </div>
        {/* <Button size="icon" variant="outline">
          <Plus className="icon-sm" />
        </Button> */}
      </DialogTrigger>
      <DialogForm
        title="Create a new folder"
        inputs={[
          {
            label: "Name",
            name: "name",
            type: "text",
            placeholder: "Enter the name of the folder",
          },
        ]}
        onSubmit={onSubmit}
        setOpen={setOpen}
      />
    </Dialog>
  );
}

export function FolderPage() {
  return (
    <>
      <div className="flex items-center">
        <CreateNewFolderButton />
      </div>
      <ListView
        dataAtom={folderListAtom}
        onLoadMore={(page) => {
          console.log("folder load more", page);
          fetchMoreFolders(page, 20);
        }}
        fetch_message_type={MESSAGE_ACTIONS.FETCH_FOLDERS}
        append_message_type={MESSAGE_ACTIONS.APPEND_FOLDERS}
        renderData={({ data, selection, toggle }) => (
          <FolderList
            data={data}
            selectionEnabled={selection.size !== 0}
            toggle={toggle}
            selection={selection}
          />
        )}
        id="folder-list"
      />
    </>
  );
}

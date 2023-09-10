import React, { useEffect, useState } from "react";
import { ListView } from "@src/pages/content/components/ListView";
import { folderListAtom } from "../../context";
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
  DialogTitle,
  DialogTrigger,
} from "@src/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Input } from "@src/components/ui/input";
import { SpinnerIcon } from "@src/components/Spinner";

type CreateNewFolderForm = {
  name: string;
  color?: string;
};

function CreateNewFolderButton() {
  const {
    register,
    handleSubmit,
  } = useForm<CreateNewFolderForm>();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const onSubmit = (data: CreateNewFolderForm) => {
    console.log("submit form", data);
    setLoading(() => true);
    createNewFolder({ ...data, children: [] });
  };

  useEffect(() => {
    const messageHandler = (request, sender, _) => {
      if (request.type === MESSAGE_ACTIONS.STATUS_SUCCESS) {
        console.log("create status success", request);
        setLoading(() => false);
        setOpen(false);
      }
    };
    chrome.runtime.onMessage.addListener(messageHandler);

    return () => {
      chrome.runtime.onMessage.removeListener(messageHandler);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/** 
        <div className="icon-container icon-container-sm">
          <Plus />
        </div>
        **/}
        <Button size="icon" variant="outline"><Plus className="icon-sm" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-3 my-6">
            <Input {...register("name", { required: true })} />
          </div>
          <DialogFooter>
            <div className="flex items-center gap-4">
              {loading && <SpinnerIcon size={24} />}
              <Button variant="default" type="submit">Create</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
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
        fetchMore={fetchMoreFolders}
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
        id="con-list"
      />
    </>
  );
}

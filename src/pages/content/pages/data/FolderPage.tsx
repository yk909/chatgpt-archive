import React, { useEffect, useState } from "react";
import { ListView } from "@src/pages/content/components/ListView";
import {
  bgResponseStatusAtom,
  folderListAtom,
  loadingAtom,
} from "../../context";
import { MESSAGE_ACTIONS } from "@src/constants";
import { FolderList } from "@src/pages/content/components/Folder";
import {
  createNewFolder,
  deleteFolder,
  fetchMoreFolders,
} from "../../messages";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import {
  ClearSelectionButton,
  SelectAllButton,
  SelectionActionBar,
} from "@src/pages/content/components/SelectionActionBar";

import { Dialog, DialogTrigger } from "@src/components/ui/dialog";
import { DialogForm } from "@src/components/DialogForm";
import { useAtom } from "jotai";
import { Spinner } from "@src/components/Spinner";

type CreateNewFolderForm = {
  newFolderName: string;
  color?: string;
};

function CreateNewFolderButton() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [responseStatus, setResponseStatus] = useAtom(bgResponseStatusAtom);

  const onSubmit = (data: CreateNewFolderForm) => {
    setLoading(() => true);
    createNewFolder({ name: data.newFolderName, children: [] });
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
        title="Create a New Folder"
        inputs={[
          {
            label: "New Folder Name",
            name: "newFolderName",
            type: "text",
            placeholder: "Enter the name of the new folder",
            autoComplete: "off",
          },
        ]}
        onSubmit={onSubmit}
        setOpen={setOpen}
      />
    </Dialog>
  );
}

export function FolderPage() {
  const [folders] = useAtom(folderListAtom);
  const [loading] = useAtom(loadingAtom);
  return (
    <>
      <div className="flex items-center h-12">
        <CreateNewFolderButton />
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <ListView
          dataAtom={folderListAtom}
          renderData={({ data, selection, toggle }) => (
            <FolderList
              data={data}
              selectionEnabled={selection.size !== 0}
              toggle={toggle}
              selection={selection}
            />
          )}
          id="folder-list"
          renderSelectionBar={({ selection, setSelection }) => (
            <SelectionActionBar
              enabled={selection.size !== 0}
              left={() => {
                return (
                  <>
                    <SelectAllButton
                      onClick={() => {
                        setSelection(new Set(folders.map((c: any) => c.id)));
                      }}
                    />
                    <ClearSelectionButton setSelection={setSelection} />
                  </>
                );
              }}
              right={() => (
                <>
                  <div
                    className="text-red-500 icon-container icon-container-sm"
                    onClick={() => {
                      console.log("delete folders", selection);
                      deleteFolder(Array.from(selection));
                      setSelection(new Set());
                    }}
                  >
                    <Trash2 />
                  </div>
                  <div className="icon-container icon-container-sm">
                    <MoreHorizontal />
                  </div>
                </>
              )}
            />
          )}
        />
      )}
    </>
  );
}

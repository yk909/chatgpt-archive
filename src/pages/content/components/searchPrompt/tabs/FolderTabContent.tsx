import { CommandList } from "@src/components/ui/command";
import { TabsContent } from "@src/components/ui/tabs";
import React from "react";
import { FolderItem } from "../FolderItem";
import { EmptyResult } from "../EmptyResult";

export default function FolderTabContent({ folders }: { folders: Folder[] }) {
  return (
    <TabsContent
      value="folders"
      className="min-h-0 flex-1"
    >
      <CommandList className="ml-2 h-full">
        {folders && folders.length !== 0 ? (
          folders.map((f) => (
            <FolderItem key={f.id} folder={f} onSelect={() => {}} />
          ))
        ) : (
          <EmptyResult name="folder" />
        )}
      </CommandList>
    </TabsContent>
  );
}

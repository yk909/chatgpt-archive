import { FolderItem } from "../FolderItem";
import { EmptyResult } from "../EmptyResult";

export default function FolderTabContent({ folders }: { folders: Folder[] }) {
  return (
    <>
      {folders && folders.length !== 0 ? (
        folders.map((f) => (
          <FolderItem key={f.id} folder={f} onSelect={() => {}} />
        ))
      ) : (
        <EmptyResult name="folder" />
      )}
    </>
  );
}

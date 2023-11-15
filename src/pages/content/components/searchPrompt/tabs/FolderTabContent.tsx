import { FolderItem } from "@src/pages/content/pages/data/FolderPage/Folder";
import { EmptyResult } from "../EmptyResult";

export default function FolderTabContent({ folders }: { folders: Folder[] }) {
  return (
    <>
      {folders && folders.length !== 0 ? (
        folders.map((f) => <FolderItem key={f.id} folder={f} />)
      ) : (
        <EmptyResult name="folder" />
      )}
    </>
  );
}

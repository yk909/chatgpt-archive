// import { CommandGroup, CommandList } from "@src/components/ui/command";
import React from "react";
import { EmptyResult } from "../EmptyResult";
import { MoreButton } from "../MoreButton";
import { ALL_TAB_GROUP_SIZE, SEARCH_TABS } from "../config";
import {
  ConversationItemWithoutSelect,
} from "@src/components/Conversation";
import { FolderItem } from "@src/components/Folder";

function GroupTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 text-sm text-muted-foreground pl-4">
      <span>{title}</span>
    </div>
  );
}

export default function AllTabContent({
  conversations,
  folders,
  handleConversationSelect,
  setTab,
}: {
  conversations: (Conversation & { keywordCount: number })[];
  folders: Folder[];
  handleConversationSelect: (id: string) => void;
  setTab: React.Dispatch<React.SetStateAction<keyof typeof SEARCH_TABS>>;
}) {
  return (
    <>
      <div>
        <GroupTitle title="Conversations" />
        {conversations && conversations.length !== 0 ? (
          conversations
            .slice(0, ALL_TAB_GROUP_SIZE)
            .map((conversation, i) => (
              <ConversationItemWithoutSelect
                key={conversation.id}
                conversation={conversation}
              />
            ))
        ) : (
          <EmptyResult name="conversation" />
        )}

        <MoreButton
          data={conversations}
          name="conversations"
          onSelect={() => {
            setTab("conversations");
          }}
        />
      </div>
      <div>
        <GroupTitle title="Folders" />
        {folders && folders.length !== 0 ? (
          folders
            .slice(0, ALL_TAB_GROUP_SIZE)
            .map((f) => <FolderItem key={f.id} folder={f} />)
        ) : (
          <EmptyResult name="folder" />
        )}

        <MoreButton
          data={folders}
          name="folders"
          onSelect={() => {
            setTab("folders");
          }}
        />
      </div>
    </>
  );
}

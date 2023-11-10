import { CommandGroup, CommandList } from "@src/components/ui/command";
import { TabsContent } from "@src/components/ui/tabs";
import React from "react";
import { EmptyResult } from "../EmptyResult";
import { MoreButton } from "../MoreButton";
import { ALL_TAB_GROUP_SIZE, SEARCH_TABS } from "../config";
import { FolderItem } from "../FolderItem";
import { ConversationItem } from "../ConversationItem";

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
    <TabsContent value="all">
      <CommandList className="flex-1 min-h-0 relative">
        <CommandGroup heading="Conversations">
          {conversations && conversations.length !== 0 ? (
            conversations
              .slice(0, ALL_TAB_GROUP_SIZE)
              .map((conversation, i) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  onSelect={() => {
                    handleConversationSelect(conversation.id);
                  }}
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
        </CommandGroup>
        <CommandGroup heading="Folders">
          {folders && folders.length !== 0 ? (
            folders
              .slice(0, ALL_TAB_GROUP_SIZE)
              .map((f) => (
                <FolderItem key={f.id} folder={f} onSelect={() => {}} />
              ))
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
        </CommandGroup>
      </CommandList>
    </TabsContent>
  );
}

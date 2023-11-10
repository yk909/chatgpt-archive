import { TabsContent } from "@src/components/ui/tabs";
import { ConversationItem } from "../ConversationItem";
import { List as ConversationList } from "../../Conversation";
import { EmptyResult } from "../EmptyResult";
import { CommandItem, CommandList } from "@src/components/ui/command";
import { ListView } from "../../ListView";
import { searchPromptConversationAtom } from "@src/pages/content/context";
import { useAtom } from "jotai";
import {
  ClearSelectionButton,
  SelectAllButton,
  SelectionActionBar,
} from "../../SelectionActionBar";
import { MoreDropdownButton } from "../../MoreDropdownButton";
import { AddToFolderDropdown } from "../../dropdown/AddToFolderDropdown";
import { useState } from "react";

export default function ConversationTabContent({
  conversations,
  handleConversationSelect,
}: {
  conversations: (Conversation & { keywordCount: number })[];
  handleConversationSelect: (id: string) => void;
}) {
  const [selection, setSelection] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelection((prev) => {
      const next = new Set(prev);
      if (selection.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <TabsContent value="conversations" className="flex-1 min-h-0">
      <CommandList className="ml-2 h-full">
        {conversations.length === 0 ? (
          <EmptyResult name="conversation" />
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              onSelect={() => {
                handleConversationSelect(conversation.id);
              }}
              selected={selection.has(conversation.id)}
              toggle={toggle}
              selectionEnabled={selection.size !== 0}
            />
          ))
        )}

        <SelectionActionBar
          enabled={selection.size !== 0}
          className="bottom-2 left-2 right-4 fixed"
          left={() => {
            return (
              <>
                <SelectAllButton
                  onClick={() => {
                    setSelection(new Set(conversations.map((c: any) => c.id)));
                  }}
                />
                <ClearSelectionButton setSelection={setSelection} />
              </>
            );
          }}
          right={() => (
            <>
              <div className="icon-container icon-container-sm">
                <MoreDropdownButton
                  contentProps={{
                    side: "top",
                  }}
                  items={
                    <>
                      <AddToFolderDropdown
                        conversationIdList={new Array(...selection)}
                      />
                    </>
                  }
                />
              </div>
            </>
          )}
        />
      </CommandList>
    </TabsContent>
  );
}

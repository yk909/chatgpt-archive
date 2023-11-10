import { TabsContent } from "@src/components/ui/tabs";
import { ConversationItem } from "../ConversationItem";
import { List as ConversationList } from "../../Conversation";
import { EmptyResult } from "../EmptyResult";
import { CommandList } from "@src/components/ui/command";
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

export default function ConversationTabContent({
  conversations,
  handleConversationSelect,
}: {
  conversations: (Conversation & { keywordCount: number })[];
  handleConversationSelect: (id: string) => void;
}) {
  const [conversationList, setConversationAtom] = useAtom(
    searchPromptConversationAtom
  );
  if (!conversationList || conversationList.length === 0) {
    return null;
  }
  return (
    <TabsContent
      value="conversations"
      className="px-2 py-1 min-h-0 flex-1 relative"
    >
      <CommandList className="absolute inset-0 ml-2">
        <ListView
          dataAtom={searchPromptConversationAtom}
          renderData={({ data, selection, toggle }) =>
            data.length === 0 ? (
              <div className="flex justify-center mt-8">No data</div>
            ) : (
              <>
                {conversations.map((conversation) => (
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
                ))}
              </>
            )
          }
          id="con-list"
          renderSelectionBar={({ selection, setSelection }) => (
            <SelectionActionBar
              enabled={selection.size !== 0}
              className="bottom-2 left-2 right-4 fixed"
              left={() => {
                return (
                  <>
                    <SelectAllButton
                      onClick={() => {
                        setSelection(
                          new Set(conversationList.map((c: any) => c.id))
                        );
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
          )}
        />
      </CommandList>
    </TabsContent>
  );
}

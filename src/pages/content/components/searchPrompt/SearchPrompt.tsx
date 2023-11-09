import { FolderItem } from "./FolderItem";
import { useEffect, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@src/components/ui/command";
import { useAtom } from "jotai";
import { searchOpenAtom } from "../../context";
import { useBgMessage } from "../../hook";
import { MESSAGE_ACTIONS } from "@src/constants";
import { search } from "../../messages";
import { CommandLoading } from "cmdk";
import { loadConversation } from "@src/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@src/components/ui/tabs";
import { SearchForm, SearchFormValues } from "./SearchForm";
import { ConversationItem } from "./ConversationItem";

import { EmptyResult } from "./EmptyResult";
import { ALL_TAB_GROUP_SIZE } from "./config";
import { MoreButton } from "./MoreButton";

type SearchResult = {
  conversations: (Conversation & { keywordCount: number })[];
  folders: Folder[];
};

const SEARCH_TABS = {
  all: {
    label: "All",
  },
  conversations: {
    label: "Conversations",
  },
  folders: {
    label: "Folders",
  },
};

const TabSubText = ({
  tab,
  result,
}: {
  tab: keyof typeof SEARCH_TABS;
  result: SearchResult;
}) => {
  return (
    <div className="text-xs text-gray-400">
      {tab !== "all" && <span>Total items: {result[tab].length}</span>}
    </div>
  );
};

export function SearchPrompt() {
  const [open, setOpen] = useAtom(searchOpenAtom);
  const [tab, setTab] = useState<keyof typeof SEARCH_TABS>("all");

  const [state, setState] = useState<{
    loading: boolean;
    result: SearchResult | null;
  }>({
    loading: false,
    result: null,
  });

  const [loading, setLoading] = useState<boolean>(false);

  const handleSeachSubmit = (data: SearchFormValues) => {
    data.query = data.query.trim();
    if (data.query === "") {
      setState(() => ({
        loading: false,
        result: null,
      }));
      return;
    }
    console.log("search form submitted", data);
    search(data.query);
    // setState(() => ({
    //   loading: true,
    //   result: null,
    // }));
  };

  useBgMessage({
    [MESSAGE_ACTIONS.SEARCH]: (request, sender, _) => {
      const data = request.data as SearchResult;
      setState(() => ({
        loading: false,
        result: data,
      }));
    },
  });

  console.log("render search prompt", state);

  const conversations = state.result?.conversations;
  const folders = state.result?.folders;

  function handleConversationSelect(conversationId: string) {
    loadConversation(conversationId);
  }

  let content = null;
  if (state.result !== null) {
    content = (
      <Tabs
        defaultValue="all"
        value={tab}
        className="flex flex-col flex-1 min-h-0"
        onValueChange={(v: keyof typeof SEARCH_TABS) => setTab(() => v)}
      >
        <div className="flex items-center justify-between px-2 pt-2 flex-none">
          <TabsList>
            {Object.keys(SEARCH_TABS).map((t, i) => (
              <TabsTrigger value={t} key={i}>
                {SEARCH_TABS[t].label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabSubText tab={tab} result={state.result} />
        </div>

        <CommandList className="flex-1 min-h-0 relative">
          {loading ? (
            <CommandLoading />
          ) : (
            <>
              <TabsContent value="all">
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
              </TabsContent>
              <TabsContent
                value="conversations"
                className="px-2 py-1 min-h-0 flex-1 overflow-scroll absolute inset-0"
              >
                {conversations && conversations.length !== 0 ? (
                  conversations.map((conversation) => (
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
              </TabsContent>
              <TabsContent
                value="folders"
                className="px-2 py-1 min-h-0 flex-1 overflow-scroll absolute inset-0"
              >
                {folders && folders.length !== 0 ? (
                  folders.map((f) => (
                    <FolderItem key={f.id} folder={f} onSelect={() => {}} />
                  ))
                ) : (
                  <EmptyResult name="folder" />
                )}
              </TabsContent>
            </>
          )}
        </CommandList>
      </Tabs>
    );
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div
        className="relative"
        style={{
          height: "580px",
        }}
      >
        <Command className="absolute rounded-lg top-0 left-0 right-0 bottom-0 shadow-lg border flex flex-col">
          <SearchForm onSubmit={handleSeachSubmit} />
          {content}
        </Command>
      </div>
    </CommandDialog>
  );
}

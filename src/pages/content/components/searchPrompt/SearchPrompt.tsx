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
import {
  searchOpenAtom,
  searchPromptConversationAtom,
  searchPromptFolderAtom,
} from "../../context";
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
import { SEARCH_TABS } from "./config";
import ConversationTabContent from "./tabs/ConversationTabContent";
import AllTabContent from "./tabs/AllTabContent";
import FolderTabContent from "./tabs/FolderTabContent";

type SearchResult = {
  conversations: (Conversation & { keywordCount: number })[];
  folders: Folder[];
};

const TabSubText = ({
  tab,
  result,
}: {
  tab: keyof typeof SEARCH_TABS;
  result: SearchResult;
}) => {
  return (
    <div className="tracking-wide text-sm mr-6">
      {tab !== "all" && (
        <span>
          Total items:
          <span className="inline-block ml-2 font-bold">
            {result[tab].length}
          </span>
        </span>
      )}
    </div>
  );
};

export function SearchPrompt() {
  const [open, setOpen] = useAtom(searchOpenAtom);
  const [tab, setTab] = useState<keyof typeof SEARCH_TABS>("all");
  const [conversationAtom, setConversationAtom] = useAtom(
    searchPromptConversationAtom
  );
  const [folderAtom, setFolderAtom] = useAtom(searchPromptFolderAtom);

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
      setTab("all");
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
      setConversationAtom(() => data.conversations);
      setFolderAtom(() => data.folders);
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
    content = loading ? (
      <CommandLoading />
    ) : (
      <>
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

          <AllTabContent
            {...state.result}
            setTab={setTab}
            handleConversationSelect={handleConversationSelect}
          />
          <ConversationTabContent
            conversations={conversations}
            handleConversationSelect={handleConversationSelect}
          />
          <FolderTabContent folders={folders} />
        </Tabs>
      </>
    );
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div
        className="relative"
        style={{
          height: "620px",
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

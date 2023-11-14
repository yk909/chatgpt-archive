import { useRef, useEffect, useCallback } from "react";
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
import { DIALOG_ANIMATION_DURATION, SEARCH_TABS } from "./config";
import ConversationTabContent from "./tabs/ConversationTabContent";
import AllTabContent from "./tabs/AllTabContent";
import FolderTabContent from "./tabs/FolderTabContent";
import { SearchResultTabAtom, SearchStateAtom } from "./context";

const TabSubText = ({
  tab,
  result,
}: {
  tab: keyof typeof SEARCH_TABS;
  result: SearchResult;
}) => {
  return (
    <div className="tracking-wide text-sm mr-4">
      {tab !== "all" && (
        <span>
          Total items:
          <span className="inline-block ml-2 font-medium">
            {result[tab].length}
          </span>
        </span>
      )}
    </div>
  );
};

export function TabContent() {
  const [{ result, loading }] = useAtom(SearchStateAtom);
  const [tab, setTab] = useAtom(SearchResultTabAtom);

  console.log("render search prompt tab content", result);

  function handleConversationSelect(conversationId: string) {
    loadConversation(conversationId);
  }

  return (
    <Tabs
      defaultValue="all"
      value={tab}
      className="flex flex-col relative px-2"
      onValueChange={(v: keyof typeof SEARCH_TABS) => setTab(() => v)}
    >
      <div className="flex items-center justify-between pt-2 flex-none">
        <TabsList>
          {Object.keys(SEARCH_TABS).map((t, i) => (
            <TabsTrigger value={t} key={i}>
              {SEARCH_TABS[t].label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabSubText tab={tab} result={result} />
      </div>

      <div
        style={{
          height: "500px",
          overflowY: "scroll",
          position: "relative",
        }}
      >
        {loading ? (
          <CommandLoading />
        ) : (
          <>
            <TabsContent value="all">
              <AllTabContent
                {...result}
                setTab={setTab}
                handleConversationSelect={handleConversationSelect}
              />
            </TabsContent>
            <TabsContent
              value="conversations"
              style={{
                position: "absolute",
                inset: 0,
                overflowY: "scroll",
              }}
            >
              <ConversationTabContent
                conversations={result.conversations}
                handleConversationSelect={handleConversationSelect}
              />
            </TabsContent>
            <TabsContent
              value="folders"
              style={{
                position: "absolute",
                inset: 0,
                overflowY: "scroll",
              }}
            >
              <FolderTabContent folders={result.folders} />
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
}

export function SearchPromptContent() {
  const [state, setState] = useAtom(SearchStateAtom);
  const [_, setTab] = useAtom(SearchResultTabAtom);

  const handleSeachSubmit = useCallback((data: SearchFormValues) => {
    const trimedQuery = data.query.trim();
    if (trimedQuery === "") {
      setState(() => ({
        loading: false,
        result: null,
        query: "",
      }));
      setTab("all");
      return;
    }
    console.log("search form submitted", data);
    search(data.query);
    setState((p) => ({
      ...p,
      loading: true,
      query: data.query,
    }));
  }, []);

  useBgMessage({
    [MESSAGE_ACTIONS.SEARCH]: (request, sender, _) => {
      const data = request.data as SearchResult;
      setState((p) => ({
        ...p,
        loading: false,
        result: data,
      }));
    },
  });

  console.log("render search prompt content", state);

  return (
    <div className="flex flex-col">
      <SearchForm onSubmit={handleSeachSubmit} query={state.query} />
      {state.query !== "" && <TabContent />}
    </div>
  );
}

export function SearchPrompt() {
  const [open, setOpen] = useAtom(searchOpenAtom);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dialogRef.current) {
      if (!open) {
        setTimeout(() => {
          dialogRef.current.setAttribute("data-state", "");
        }, DIALOG_ANIMATION_DURATION);
      }
    }
  }, [dialogRef.current, open]);
  console.log("render search prompt container", open);

  return (
    <div
      ref={dialogRef}
      style={
        {
          "--duration": DIALOG_ANIMATION_DURATION + "ms",
        } as React.CSSProperties
      }
      className="fixed z-50 grid w-full max-w-xl gap-4 bg-background shadow-lg sm:rounded-lg md:w-full p-0 overflow-hidden bg-transparent search-prompt border rounded-lg border-background-2"
      data-state={open ? "open" : "closed"}
    >
      <SearchPromptContent />
    </div>
  );
}

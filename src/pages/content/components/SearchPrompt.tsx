import {
  Calculator,
  Calendar,
  CreditCard,
  Folder as FolderIcon,
  MessageSquare,
  Search,
  Settings,
  Smile,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@src/components/ui/command";
import { useAtom } from "jotai";
import { searchOpenAtom } from "../context";
import { useBgMessage } from "../hook";
import { MESSAGE_ACTIONS } from "@src/constants";
import { Conversation, Folder } from "@src/types";
import { useForm } from "react-hook-form";
import { Input } from "@src/components/ui/input";
import { Button } from "@src/components/ui/button";
import { search } from "../messages";
import { CommandLoading } from "cmdk";
import { loadConversation } from "@src/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@src/components/ui/tabs";

type SearchResult = {
  conversations: Conversation[];
  folders: Folder[];
};

type SearchFormValues = {
  query: string;
};

function SearchForm({
  onSubmit,
}: {
  onSubmit: (data: SearchFormValues) => void;
}) {
  console.log("render search form");

  return (
    <form>
      <div className="flex items-center px-3 py-1 border-b border-background-2">
        <Search className="w-4 h-4 mr-2 opacity-50 shrink-0" />
        <Input
          className={"flex h-11 w-full rounded-md bg-transparent py-3 px-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none"}
          placeholder="Search conversations, folders, and more"
          type="text"
          onChange={(e) => {
            onSubmit({
              query: e.target.value,
            });
          }}
        />
      </div>
    </form>
  );
}

function EmptyResult({ name }: { name: string }) {
  return (
    <div className="w-full flex items-center justify-center py-6 text-sm">
      {`No ${name} found`}
    </div>
  );
}

const ALL_TAB_GROUP_SIZE = 3;
const SEARCH_TABS = {
  "all": {
    label: "All",
  },
  "conversations": {
    label: "Conversations",
  },
  "folders": {
    label: "Folders",
  },
};

export function SearchPrompt() {
  const [open, setOpen] = useAtom(searchOpenAtom);
  const [tab, setTab] = useState<keyof typeof SEARCH_TABS>("all");

  const [state, setState] = useState<{
    loading: boolean;
    result: {
      conversations: Conversation[];
      folders: Folder[];
    } | null;
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

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command className="border rounded-lg shadow-md">
        <SearchForm onSubmit={handleSeachSubmit} />
        <CommandList className="max-h-[500px]">
          {loading
            ? <CommandLoading />
            : state.result !== null && (
              <Tabs defaultValue="all" value={tab} onValueChange={setTab}>
                <div className="px-2 pt-2">
                  <TabsList>
                    {Object.keys(SEARCH_TABS).map((t) => (
                      <TabsTrigger value={t}>
                        {SEARCH_TABS[t].label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                <TabsContent value="all">
                  <CommandGroup heading="Conversations">
                    {(conversations && conversations.length !== 0)
                      ? conversations.slice(0, ALL_TAB_GROUP_SIZE)
                        .map((conversation, i) => (
                          <CommandItem
                            key={conversation.id}
                            value={conversation.id}
                            onSelect={() =>
                              handleConversationSelect(conversation.id)}
                          >
                            <MessageSquare
                              className="mr-2 flex-none"
                              size={16}
                            />
                            <span className="flex-1 min-w-0 truncate">
                              {conversation.title}
                            </span>
                          </CommandItem>
                        ))
                      : <EmptyResult name="conversation" />}
                    {conversations &&
                      conversations.length > ALL_TAB_GROUP_SIZE && (
                      <CommandItem
                        key="conversation-more"
                        value="c-more"
                        onSelect={() => {
                          setTab("conversations");
                        }}
                      >
                        <span className="flex items-center justify-center text-sm flex-1 text-slate-500">
                          See all {conversations.length} results
                        </span>
                      </CommandItem>
                    )}
                  </CommandGroup>
                  <CommandGroup heading="Folders">
                    {(folders && folders.length !== 0)
                      ? folders.slice(0, ALL_TAB_GROUP_SIZE)
                        .map((f) => (
                          <CommandItem
                            key={f.id}
                            value={f.id}
                          >
                            <FolderIcon className="mr-2 flex-none" size={16} />
                            <span className="flex-1 min-w-0 truncate">
                              {f.name}
                            </span>
                          </CommandItem>
                        ))
                      : <EmptyResult name="folder" />}
                    {folders &&
                      folders.length > ALL_TAB_GROUP_SIZE && (
                      <CommandItem
                        key="folder-more"
                        value="f-more"
                        onSelect={() => {
                          setTab("folders");
                        }}
                      >
                        <span className="flex items-center justify-center text-sm flex-1 text-slate-500">
                          See all {folders.length} results
                        </span>
                      </CommandItem>
                    )}
                  </CommandGroup>
                </TabsContent>
                <TabsContent value="conversations" className="py-1 px-2">
                  {(conversations && conversations.length !== 0)
                    ? conversations.map((conversation) => (
                      <CommandItem
                        key={conversation.id}
                        value={conversation.id}
                        onSelect={() =>
                          handleConversationSelect(conversation.id)}
                      >
                        <MessageSquare className="mr-2 flex-none" size={16} />
                        <span className="flex-1 min-w-0 truncate">
                          {conversation.title}
                        </span>
                      </CommandItem>
                    ))
                    : <EmptyResult name="conversation" />}
                </TabsContent>
                <TabsContent value="folders" className="py-1 px-2">
                  {(folders && folders.length !== 0)
                    ? folders.map((f) => (
                      <CommandItem
                        key={f.id}
                        value={f.id}
                      >
                        <FolderIcon className="mr-2 flex-none" size={16} />
                        <span className="flex-1 min-w-0 truncate">
                          {f.name}
                        </span>
                      </CommandItem>
                    ))
                    : <EmptyResult name="folder" />}
                </TabsContent>
              </Tabs>
            )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

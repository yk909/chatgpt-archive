import {
  Calculator,
  Calendar,
  CreditCard,
  MessageSquare,
  Search,
  Settings,
  Smile,
  User,
} from "lucide-react";
import { useState } from "react";
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
import { Conversation } from "@src/types";
import { useForm } from "react-hook-form";
import { Input } from "@src/components/ui/input";
import { Button } from "@src/components/ui/button";
import { search } from "../messages";

type SearchResult = {
  conversations: Conversation[];
};

type SearchFormValues = {
  query: string;
};

function SearchForm({
  onSubmit,
}: {
  onSubmit: (data: SearchFormValues) => void;
}) {
  const { register, handleSubmit, getValues } = useForm<SearchFormValues>();

  console.log("render search form");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center px-3 py-1 border-b border-background-2">
        <Search className="w-4 h-4 mr-2 opacity-50 shrink-0" />
        <Input
          className={
            "flex h-11 w-full rounded-md bg-transparent py-3 px-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none"
          }
          placeholder="Search conversations, folders, and more"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit(getValues());
            }
          }}
          {...register("query", { required: true })}
        />
      </div>
    </form>
  );
}

export function SearchPrompt() {
  const [open, setOpen] = useAtom(searchOpenAtom);

  const [searchResult, setSearchResult] = useState<SearchResult>({
    conversations: [],
  });

  const handleSeachSubmit = (data: SearchFormValues) => {
    console.log("search form submitted", data);
    search(data.query);
  };

  useBgMessage({
    [MESSAGE_ACTIONS.SEARCH]: (request, sender, _) => {
      const data = request.data as SearchResult;
      setSearchResult(data);
    },
  });

  console.log("render search prompt", { searchResult });

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command className="border rounded-lg shadow-md">
        <SearchForm onSubmit={handleSeachSubmit} />
        <CommandList className="max-h-[500px]">
          <CommandGroup heading="Conversations">
            {searchResult.conversations.map((conversation) => (
              <CommandItem key={conversation.id}>
                <MessageSquare className="w-4 h-4 mr-2" />
                <span>{conversation.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

import { Input } from "@src/components/ui/input";
import { useAtom } from "jotai";
import { Search } from "lucide-react";
import React from "react";
import { searchOpenAtom } from "../../context";
import { useEffect } from "react";

export type SearchFormValues = {
  query: string;
};

export const SearchForm = React.memo(function SearchForm({
  onSubmit,
  query,
}: {
  onSubmit: (data: SearchFormValues) => void;
  query: string;
}) {
  const [open] = useAtom(searchOpenAtom);
  console.log("render SearchForm");
  const ref = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current && open) {
      console.log("focus search input");
      ref.current.focus();
    }
  }, [ref.current, open]);
  return (
    <form className="flex items-center px-3 py-1 border-b border-background-2">
      <Search className="w-4 h-4 mr-2 opacity-50 shrink-0" />
      <Input
        ref={ref}
        className={
          "flex h-10 w-full rounded-md bg-transparent py-2 px-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none"
        }
        value={query}
        placeholder="Search conversations, folders, and more"
        type="text"
        onChange={(e) => {
          onSubmit({
            query: e.target.value,
          });
        }}
      />
    </form>
  );
});

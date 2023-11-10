import { Input } from "@src/components/ui/input";
import { Search } from "lucide-react";

export type SearchFormValues = {
  query: string;
};

export function SearchForm({
  onSubmit,
  query,
}: {
  onSubmit: (data: SearchFormValues) => void;
  query: string;
}) {
  return (
    <form className="flex items-center px-3 py-1 border-b border-background-2">
      <Search className="w-4 h-4 mr-2 opacity-50 shrink-0" />
      <Input
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
}

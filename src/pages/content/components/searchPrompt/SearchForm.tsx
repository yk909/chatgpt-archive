import { Input } from "@src/components/ui/input";
import { Search } from "lucide-react";

export type SearchFormValues = {
  query: string;
};

export function SearchForm({
  onSubmit,
}: {
  onSubmit: (data: SearchFormValues) => void;
}) {
  return (
    <form>
      <div className="flex items-center px-3 py-1 border-b border-background-2">
        <Search className="w-4 h-4 mr-2 opacity-50 shrink-0" />
        <Input
          className={
            "flex h-11 w-full rounded-md bg-transparent py-3 px-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none"
          }
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

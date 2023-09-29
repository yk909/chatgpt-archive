import { CommandItem } from "@src/components/ui/command";
import { ALL_TAB_GROUP_SIZE } from "./config";

export function MoreButton({
  data,
  key,
  onSelect,
}: {
  data: any[];
  key: string;
  onSelect: () => void;
}) {
  return (
    data &&
    data.length > ALL_TAB_GROUP_SIZE && (
      <CommandItem
        key={key + "-more"}
        value={key + "-more"}
        onSelect={onSelect}
      >
        <span className="flex items-center justify-center flex-1 text-sm cursor-pointer text-muted-foreground">
          See all {data.length} results
        </span>
      </CommandItem>
    )
  );
}
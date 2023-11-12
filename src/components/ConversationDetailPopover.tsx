import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { InfoIcon } from "./Icon";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { cn } from "@src/lib/utils";

export function formatDates(s: string): string {
  const date = new Date(s);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="w-[84px]">{children}</div>;
}

function Value({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 min-h-0 truncate text-foreground">{children}</div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex text-sm text-muted-foreground">
      <Label>{label}</Label>
      <Value>{value}</Value>
    </div>
  );
}

export function ConversationDetailPopover({
  conversation,
  className = "",
}: {
  conversation: Conversation;
} & React.ComponentProps<typeof PopoverTrigger>) {
  return (
    <Popover>
      <PopoverTrigger className={className}>
        <InfoIcon size="md" />
      </PopoverTrigger>
      <PopoverContent className="w-[320px]">
        <div>
          <Row
            label="Create time:"
            value={formatDates(conversation.create_time)}
          />
          <Row
            label="Update time:"
            value={formatDates(conversation.update_time)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ConversationDetailPopoverDropdown({
  conversation,
}: {
  conversation: Conversation;
}) {
  return (
    <Popover>
      <PopoverTrigger>
        <DropdownMenuItem>
          <InfoIcon size="sm" />
        </DropdownMenuItem>
      </PopoverTrigger>
      <PopoverContent>
        <div>
          <div className="text-sm text-muted-foreground">
            Create time: {formatDates(conversation.create_time)}
          </div>
          <div className="text-sm text-muted-foreground">
            Update time: {formatDates(conversation.update_time)}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

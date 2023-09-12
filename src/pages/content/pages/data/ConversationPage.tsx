import { MESSAGE_ACTIONS } from "@src/constants";
import {
  conversationListAtom,
  displayConversationListAtom,
  loadingAtom,
} from "@src/pages/content/context";
import { List as ConversationList } from "@src/pages/content/components/Conversation";
import { fetchMoreConversations } from "@src/pages/content/messages";
import { ListView } from "@src/pages/content/components/ListView";
import { categorizeConversations } from "@src/utils";
import { type Conversation } from "@src/types";
import { useState } from "react";
import { PAGE_SIZE } from "@src/pages/background/config";
import { Spinner } from "@src/components/Spinner";
import { useAtom } from "jotai";
import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
} from "@src/components/ui/select";
import { useEffect } from "react";
import { SelectionActionBar } from "@src/pages/content/components/SelectionActionBar";

const ORDER_BY_OPTIONS = [
  {
    label: "Last updated",
    value: "update_time",
  },
  {
    label: "Created time",
    value: "create_time",
  },
];

export function ConversationPage() {
  const [orderBy, setOrderBy] = useState<keyof Conversation>("update_time");
  const [loading, seLoading] = useAtom(loadingAtom);
  const [conversationList, setConversationList] = useAtom(conversationListAtom);

  useEffect(() => {
    setConversationList((p) => {
      return p.sort((a, b) => {
        return new Date(a[orderBy]).getTime() - new Date(b[orderBy]).getTime();
      });
    });
  }, [orderBy]);

  return (
    <>
      <div className="flex items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Select
              onValueChange={(v) => {
                setOrderBy(v as keyof Conversation);
              }}
              defaultValue="update_time"
            >
              <SelectTrigger>
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <span className="text-sm">Order by</span>
              </SelectTrigger>
              <SelectContent align="end">
                {ORDER_BY_OPTIONS.map((option, i) => (
                  <SelectItem key={i} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <ListView
          dataAtom={conversationListAtom}
          renderData={({ data, selection, toggle }) =>
            data.length === 0 ? (
              <div>No data</div>
            ) : (
              Object.entries(categorizeConversations(data, orderBy)).map(
                ([key, value], i) => {
                  if (value.length === 0) return <></>;
                  return (
                    <div className="relative" key={i}>
                      <div
                        className="sticky top-0 py-3 text-sm text-slate-300 bg-background"
                        style={{
                          paddingLeft: "12px",
                          fontSize: "13px",
                          zIndex: `${10 + i * 2}`,
                        }}
                      >
                        {key}
                      </div>
                      <ConversationList
                        data={value}
                        selectionEnabled={selection.size !== 0}
                        toggle={toggle}
                        selection={selection}
                      />
                    </div>
                  );
                }
              )
            )
          }
          id="con-list"
          renderSelectionBar={({ selection, setSelection }) => (
            <SelectionActionBar
              enabled={selection.size !== 0}
              handleClear={() => setSelection(new Set())}
              handleSelectAll={() => {
                setSelection(new Set(conversationList.map((c: any) => c.id)));
              }}
            />
          )}
        />
      )}
    </>
  );
}

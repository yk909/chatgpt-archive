import { MESSAGE_ACTIONS, styles } from "@src/constants";
import { HiX } from "react-icons/hi";
import { List as ConversationList } from "./Conversation";
import { Loading } from "./Loading";
import { Conversation } from "@src/types";
import { Resizer } from "./Resizer";
import { Container as IconContainer } from "./Icon";
import { FiSearch } from "react-icons/fi";
import { useEffect } from "react";
import { RotateCw } from "lucide-react";

export default function Panel({
  setOpen,
  open,
  conversationList,
  currentConversationId,
  loading,
  setLoading,
}: {
  setOpen: (state: boolean) => void;
  open: boolean;
  conversationList: Conversation[];
  currentConversationId: string;
  loading: boolean;
  setLoading: (state: () => boolean) => void;
}) {
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("form submitted");
    const term = e.currentTarget.term.value;
    setLoading(() => true);
    chrome.runtime.sendMessage({
      type: MESSAGE_ACTIONS.FETCH_FILTERED_CONVERSATIONS,
      data: {
        title: term,
      },
    });
  };

  function handleRefresh() {
    chrome.runtime.sendMessage({
      type: MESSAGE_ACTIONS.REFRESH,
    });
    setLoading(() => true);
  }

  useEffect(() => {
    if (open) {
      const searchInput = document.querySelector(
        "#search-input"
      ) as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }
  }, [open]);
  return (
    <div
      className="fixed top-0 right-0 flex flex-col h-screen p-3 overflow-hidden resize-x"
      style={{
        width: "400px",
        boxShadow: open ? "0 0 10px rgba(0,0,0,0.2)" : "none",
        zIndex: 999,
        transform: open ? "translateX(0%)" : "translateX(100%)",
        overflowY: "scroll",
        background: styles.COLOR_DARK_2,
        color: styles.COLOR_WHITE_1,
        transition: "transform 0.3s ease-out",
      }}
      id="panel"
    >
      {/* Resizer */}
      <Resizer selector="#panel" />

      {/* Header */}
      <div
        className="flex items-center flex-none mb-3"
        style={{
          height: styles.PANEL_LINE_HEIGHT,
        }}
      >
        <IconContainer
          onClick={() => {
            handleRefresh();
          }}
        >
          <RotateCw
            style={{
              width: "20px",
              height: "20px",
            }}
          />
        </IconContainer>
        <div className="flex-1"></div>
        <IconContainer onClick={() => setOpen(!open)}>
          <HiX
            style={{
              width: "20px",
              height: "20px",
            }}
          />
        </IconContainer>
      </div>

      <div className="flex mb-3">
        <form onSubmit={handleFormSubmit} className="flex items-center w-full">
          <input
            type="text"
            placeholder="Search"
            name="term"
            id="search-input"
            className="flex-1 min-h-0 rounded-lg card"
            style={{
              height: "44px",
              outline: "none",
              borderColor: styles.COLOR_CARD_BORDER,
              // color: styles.COLOR_WHITE_1,
              background: "transparent",
            }}
          />
          <button
            type="submit"
            className="flex-none h-full rounded-lg fcenter trans card"
            style={{
              marginLeft: "8px",
              width: "44px",
              height: "44px",
              borderColor: styles.COLOR_CARD_BORDER,
              borderWidth: "1px",
            }}
          >
            <FiSearch size={20} />
          </button>
        </form>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          <div>
            <div className="flex items-center py-2">
              <div
                className="flex-1"
                style={{
                  fontSize: "14px",
                }}
              >
                Found {conversationList.length} result(s)
              </div>
            </div>
          </div>
          <ConversationList
            data={conversationList}
            currentId={currentConversationId}
          />
        </>
      )}
    </div>
  );
}

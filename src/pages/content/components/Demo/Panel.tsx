import { MESSAGE_ACTIONS, styles } from "@src/constants";
import { HiX } from "react-icons/hi";
import { List as ConversationList } from "./Conversation";
import { Loading } from "./Loading";
import { Conversation } from "@src/types";
import { Resizer } from "./Resizer";
import { Container as IconContainer } from "./Icon";
import { FiSearch } from "react-icons/fi";
import { useEffect } from "react";
import { RotateCw, X, MoreHorizontal } from "lucide-react";
import { categorizeConversations } from "@src/utils";
import { useState } from "react";
import { useSelection } from "./context";
import { CheckboxInput } from "./Input";

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
  const {
    selected,
    setSelected,
    enabled: selectionModeEnabled,
    reset: resetSelection,
  } = useSelection();

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

  console.log("render panel", {
    selectAll: selected.size === conversationList.length,
  });

  return (
    <div
      className={
        "fixed top-0 right-0 flex flex-col h-screen p-3 overflow-hidden resize-x side-toggle-hover " +
        (open ? "open" : "")
      }
      id="panel"
    >
      {/* Resizer */}
      {/* <Resizer selector="#panel" /> */}

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

      {/* Line - Search */}
      <div className="flex">
        <form onSubmit={handleFormSubmit} className="flex items-center w-full">
          <input
            type="text"
            placeholder="Search"
            name="term"
            id="search-input"
            className="flex-1 min-h-0 bg-transparent rounded-lg card trans"
            style={{
              height: "44px",
              outline: "none",
              borderColor: styles.COLOR_CARD_BORDER,
              // color: styles.COLOR_WHITE_1,
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

      {/* Line - Conversation List */}
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="relative flex items-center pt-5">
            {selectionModeEnabled && (
              <div
                className="absolute flex items-center"
                style={{
                  left: "12px",
                  right: "12px",
                }}
              >
                <CheckboxInput
                  id="c-all"
                  checked={selected.size === conversationList.length}
                  onClick={(e) => {
                    console.log(
                      "select all",
                      selected.size === conversationList.length
                    );
                    if (selected.size === conversationList.length) {
                      setSelected(new Set());
                    } else {
                      setSelected(new Set(conversationList.map((c) => c.id)));
                    }
                  }}
                />
                <div className="flex-1"></div>
                <IconContainer
                  onClick={() => {
                    console.log("more");
                  }}
                >
                  <MoreHorizontal size={20} />
                </IconContainer>
              </div>
            )}

            <div
              className="flex-1 tracking-wider text-gray-500 fcenter"
              style={{
                fontSize: "14px",
              }}
            >
              <span>
                {"Showing "}
                <span className="font-bold text-white">
                  {conversationList.length}
                </span>
                {" conversations"}
              </span>
            </div>
          </div>
          {/* 
          {selectionModeEnabled && (
            <div className="flex items-center my-1">
              <IconContainer
                onClick={() => {
                  resetSelection();
                }}
              >
                <X />
              </IconContainer>
              <CheckboxInput
                id="c-all"
                checked={selected.size === conversationList.length}
                onClick={(e) => {
                  e.preventDefault();
                  if (selected.size === conversationList.length) {
                    setSelected(new Set());
                  } else {
                    setSelected(new Set(conversationList.map((c) => c.id)));
                  }
                }}
              />
            </div>
          )} */}

          <div className="flex-1 min-h-0 con-list">
            {Object.entries(categorizeConversations(conversationList)).map(
              ([key, value], i) => {
                if (value.length === 0) return <></>;
                return (
                  <div className="relative" key={i}>
                    <div
                      className="sticky top-0 py-3 text-sm text-gray-500 bg-gray-900"
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
                      currentId={currentConversationId}
                    />
                  </div>
                );
              }
            )}
          </div>
        </>
      )}

      {/* Line - Footer */}
      <div className="flex items-center flex-none py-3 bg-gray-900">
        <div className="flex-1 fcenter">
          <button>Download All Conversations</button>
        </div>
      </div>
    </div>
  );
}

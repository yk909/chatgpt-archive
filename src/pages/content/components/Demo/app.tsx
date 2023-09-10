import { useEffect, useState } from "react";
import { Conversation } from "@src/types";
import { getCurrentConversationId } from "@src/utils";
import { Thumb } from "../Thumb";
import { fetch_session, fetchAllConversations } from "@src/api";
import Panel from "../Panel";
import { MESSAGE_ACTIONS } from "@src/constants";
import { SelectionProviderWrapper } from "./context";

const KEYBOARD_SHORTCUTS_GLBOAL = [
  {
    name: "closePanel",
    keyCondition: (e: KeyboardEvent) => e.key === "Escape",
  },
  {
    name: "togglePanel",
    keyCondition: (e: KeyboardEvent) => e.ctrlKey && e.key === "k",
  },
];

const KEYBOARD_SHORTCUTS_CONVERSATION = [
  {
    name: "gotoNextConversation",
    keyCondition: (e: KeyboardEvent) => e.ctrlKey && e.key === "ArrowDown",
  },
  {
    name: "gotoPreviousConversation",
    keyCondition: (e: KeyboardEvent) => e.ctrlKey && e.key === "ArrowUp",
  },
];

const DEFAULT_SETTINGS = {
  resizeMain: false,
};

export default function App() {
  const [open, setOpen] = useState<boolean | null>(null);
  const [displayData, setDisplayData] = useState<Conversation[]>([]); // for search
  const [loading, setLoading] = useState<boolean>(true);
  const [currentConversationIndex, setCurrentConversationIndex] =
    useState<number>(-1);
  const [currentConversationId, setCurrentConversationId] =
    useState<string>("");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const gotoNextConversation = () => {
    const currentConversationIndex = displayData.findIndex(
      (conversation) => conversation.id === currentConversationId
    );
    if (currentConversationIndex === -1) return;
    if (currentConversationIndex === displayData.length) {
      return;
    }
    const nextConversationIndex = currentConversationIndex + 1;
    const nextConversationId = displayData[nextConversationIndex].id;
    window.location.href = `/c/${nextConversationId}`;
  };

  const gotoPreviousConversation = () => {
    if (currentConversationIndex === -1) return;
    if (currentConversationIndex === 0) {
      return;
    }
    const previousConversationIndex = currentConversationIndex - 1;
    const previousConversationId = displayData[previousConversationIndex].id;
    window.location.href = `/c/${previousConversationId}`;
  };

  useEffect(() => {
    // initializing

    // set up listener for messages from background
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.type) {
        case MESSAGE_ACTIONS.FETCHING_APP_STATE: {
          console.log("app state from storage", request.data);
          const { toggleState } = request.data;
          setOpen(() => toggleState);
          break;
        }
        case MESSAGE_ACTIONS.FINISH_FETCHING_CONVERSATIONS: {
          setLoading(() => false);
          setDisplayData(() => request.data);
          break;
        }
        case MESSAGE_ACTIONS.FINISH_SEARCHING_CONVERSATIONS: {
          setDisplayData(() => request.data);
          setLoading(() => false);
          break;
        }
        case MESSAGE_ACTIONS.UPDATE_FETCHING_CONVERSATION_DETAIL: {
          console.log("receive detail update", {
            progress: request.progress,
            total: request.total,
          });
          break;
        }
        case MESSAGE_ACTIONS.TOGGLE_PANEL: {
          setOpen((prev) => !prev);
          break;
        }
      }
    });

    // set up listener for keydown

    const keyFunctions = {
      closePanel: () => {
        setOpen(() => false);
      },
      togglePanel: () => {
        setOpen((prev) => !prev);
      },
    };

    const keydownListener = (e: KeyboardEvent) => {
      for (let i = 0; i < KEYBOARD_SHORTCUTS_GLBOAL.length; i++) {
        const shortcut = KEYBOARD_SHORTCUTS_GLBOAL[i];
        if (shortcut.keyCondition(e)) {
          e.preventDefault();
          keyFunctions[shortcut.name]();
          break;
        }
      }
    };

    document.addEventListener("keydown", keydownListener);

    // get conversation list from html

    // get current conversation from html
    setCurrentConversationId(() => getCurrentConversationId());

    // set main body to make space for panel
    document.querySelector("#__next").classList.add("side-toggle-main-window");

    // set message to fetch all conversations
    chrome.runtime.sendMessage({
      type: MESSAGE_ACTIONS.INIT,
    });

    return () => {
      document.removeEventListener("keydown", keydownListener);
    };
  }, []);

  useEffect(() => {
    if (currentConversationId === "") return;
    const currentConversationIndex = displayData.findIndex(
      (conversation) => conversation.id === currentConversationId
    );
    console.log("set currentConversationIndex", currentConversationIndex);
    setCurrentConversationIndex(() => currentConversationIndex);
  }, [currentConversationId, displayData]);

  useEffect(() => {
    const keyFunctions = {
      gotoNextConversation: () => {
        gotoNextConversation();
      },
      gotoPreviousConversation: () => {
        gotoPreviousConversation();
      },
    };

    const keydownListener = (e: KeyboardEvent) => {
      for (let i = 0; i < KEYBOARD_SHORTCUTS_CONVERSATION.length; i++) {
        const shortcut = KEYBOARD_SHORTCUTS_CONVERSATION[i];
        if (shortcut.keyCondition(e)) {
          keyFunctions[shortcut.name]();
          break;
        }
      }
    };

    document.addEventListener("keydown", keydownListener);

    return () => {
      document.removeEventListener("keydown", keydownListener);
    };
  }, [currentConversationIndex]);

  useEffect(() => {
    if (open === null) return;
    if (settings.resizeMain) {
      if (open) {
        document.querySelector("#__next").classList.add("side-open");
      } else {
        document.querySelector("#__next").classList.remove("side-open");
      }
    }
    chrome.runtime.sendMessage({
      type: MESSAGE_ACTIONS.SAVE_APP_STATE,
      data: {
        toggleState: open,
      },
    });
  }, [open]);

  return (
    <SelectionProviderWrapper>
      <div className="content-view-container">
        <Panel
          setOpen={setOpen}
          open={open}
          conversationList={displayData}
          currentConversationId={currentConversationId}
          loading={loading}
          setLoading={setLoading}
        />
        <Thumb setOpen={setOpen} open={open} loading={loading} />
      </div>
    </SelectionProviderWrapper>
  );
}

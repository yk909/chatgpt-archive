import { useEffect, useState } from "react";
import { Conversation } from "@src/types";
import { getCurrentConversationId } from "@src/utils";
import { Thumb } from "./Thumb";
import { fetch_session, fetchAllConversations } from "@src/api";
import Panel from "./Panel";
import { MESSAGE_ACTIONS } from "@src/constants";

export default function App() {
  const [open, setOpen] = useState(false);
  const [displayData, setDisplayData] = useState<Conversation[]>([]); // for search
  const [loading, setLoading] = useState(true);
  const currentConversationId = getCurrentConversationId();

  useEffect(() => {
    chrome.runtime.sendMessage({
      type: MESSAGE_ACTIONS.INIT,
    });
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === MESSAGE_ACTIONS.FINISH_FETCHING_CONVERSATIONS) {
        setLoading(() => false);
        setDisplayData(() => request.data);
      } else if (
        request.type === MESSAGE_ACTIONS.FINISH_SEARCHING_CONVERSATIONS
      ) {
        setDisplayData(() => request.data);
        setLoading(() => false);
      } else if (
        request.type === MESSAGE_ACTIONS.UPDATE_FETCHING_CONVERSATION_DETAIL
      ) {
        // setToken(() => request.data);
        console.log("receive detail update", {
          progress: request.progress,
          total: request.total,
        });
      } else if (request.type === MESSAGE_ACTIONS.TOGGLE_PANEL) {
        setOpen((prev) => !prev);
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        setOpen(() => false);
      } else if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    });
  }, []);

  return (
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
  );
}

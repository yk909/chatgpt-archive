import { useEffect, useState } from "react";
import { Conversation } from "@src/types";
import { getCurrentConversationId } from "@src/utils";
import { Thumb } from "./Thumb";
import { fetch_session, fetchAllConversations } from "@src/api";
import Panel from "./Panel";
import { MESSAGE_ACTIONS } from "@src/constants";

export default function App() {
  const [open, setOpen] = useState(false);
  const [conversationList, setConversationList] = useState<Conversation[]>([]);
  const [displayData, setDisplayData] = useState<Conversation[]>([]); // for search
  const [searchTerm, setSearchTerm] = useState(""); // for search
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const currentConversationId = getCurrentConversationId();

  useEffect(() => {
    chrome.runtime.sendMessage(
      { type: MESSAGE_ACTIONS.START_FETCHING_CONVERSATIONS },
      (res) => {
        setConversationList(res.data);
        setLoading(() => false);
        setDisplayData(() => res.data);
      }
    );
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === MESSAGE_ACTIONS.FINISH_FETCHING_CONVERSATIONS) {
        setConversationList(request.data);
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
      }
    });
  }, []);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("form submitted");
    const term = e.currentTarget.term.value;
    setSearchTerm(() => term);
    // setDisplayData(() => {
    //   const newList = conversationList.filter((item) =>
    //     item.title.toLowerCase().includes(term.toLowerCase())
    //   );
    //   return newList;
    // });
    setLoading(() => true);
    chrome.runtime.sendMessage({
      type: MESSAGE_ACTIONS.FETCH_FILTERED_CONVERSATIONS,
      data: {
        title: term,
      },
    });
  };

  return (
    <div className="content-view-container">
      <Panel
        setOpen={setOpen}
        open={open}
        conversationList={displayData}
        currentConversationId={currentConversationId}
        loading={loading}
        handleFormSubmit={handleFormSubmit}
      />
      <Thumb setOpen={setOpen} open={open} loading={loading} />
    </div>
  );
}

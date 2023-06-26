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
    // chrome.storage.local.get("accessToken", (data) => {
    //   if (data.accessToken !== undefined && data.accessToken !== "") {
    //     setToken(data.accessToken);
    //   } else {
    //     fetch_session().then((data) => {
    //       if (!data.accessToken) return;
    //       setToken(data.accessToken);
    //       fetchAllConversations(token).then((data) => {
    //         if (data) {
    //           setConversationList(data);
    //           setLoading(() => false);
    //           setSearchTerm(() => "");
    //           setDisplayData(() => data);
    //         }
    //       });
    //     });
    //   }
    // });

    // chrome.storage.local.get("conversationList", (data) => {
    //   if (
    //     data.conversationList !== undefined &&
    //     data.conversationList.length !== 0
    //   ) {
    //     setConversationList(data.conversationList);
    //     setLoading(() => false);
    //     setDisplayData(() => data.conversationList);
    //   }
    // });
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
      }
    });
  }, []);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("form submitted");
    const term = e.currentTarget.term.value;
    setSearchTerm(() => term);
    setDisplayData(() => {
      const newList = conversationList.filter((item) =>
        item.title.toLowerCase().includes(term.toLowerCase())
      );
      return newList;
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

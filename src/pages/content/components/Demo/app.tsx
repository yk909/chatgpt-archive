import { useEffect, useState } from "react";
import { styles } from "@src/constants";
import { HiX } from "react-icons/hi";
import { ImSpinner2 } from "react-icons/im";
import { BsClockHistory } from "react-icons/bs";
import { Conversation } from "@src/types";
import ConversationItem from "./ConversationItem";
import { getCurrentConversationId } from "@src/utils";

async function fetch_session() {
  return await fetch("https://chat.openai.com/api/auth/session").then(
    (response) => response.json()
  );
}

const fetch_conversations = async (offset, limit, order, token) => {
  return await fetch(
    `https://chat.openai.com/backend-api/conversations?offset=${offset}&limit=${limit}&order=${order}`,
    {
      headers: {
        authorization: "Bearer " + token,
        "content-type": "application/json",
      },
      method: "GET",
    }
  ).then((response) => response.json());
};

async function fetch_conversation_detail(conversationId, token) {
  return await fetch(
    `https://chat.openai.com/backend-api/conversation/${conversationId}`,
    {
      headers: {
        authorization: "Bearer " + token,
        "content-type": "application/json",
      },
      method: "GET",
    }
  );
}

function fetchAllConversationsGivenTotal(total_count, token) {
  const limit = 50;
  const page_count = Math.ceil(total_count / limit);
  const order = "updated";
  const promises = [];
  for (let i = 0; i < page_count; i++) {
    promises.push(fetch_conversations(i * limit, limit, order, token));
  }
  return Promise.all(promises).then((data) => {
    const all_conversations = [];
    data.forEach((d) => {
      all_conversations.push(...d.items);
    });
    return all_conversations;
  });
}

async function fetchAllConversations(token) {
  console.log("fetching all conversations......");
  const data = await fetch_conversations(0, 10, "updated", token);
  if (!data.items) return null;
  const conversationCount = data.total;
  const all_conversations = await fetchAllConversationsGivenTotal(
    conversationCount,
    token
  );
  console.log("done fetching", all_conversations);
  return all_conversations;
}

export default function App() {
  const [open, setOpen] = useState(false);
  const [conversationList, setConversationList] = useState<Conversation[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const currentConversationId = getCurrentConversationId();

  useEffect(() => {
    fetch_session().then((data) => {
      if (!data.accessToken) return;
      setToken(data.accessToken);
    });
  }, []);

  useEffect(() => {
    if (token) {
      fetchAllConversations(token).then((data) => {
        if (data) {
          setConversationList(data);
          setLoading(() => false);
        }
      });
    }
  }, [token]);

  return (
    <div className="content-view-container">
      <div
        className="trans p-2 fixed flex flex-col top-0 right-0 h-screen"
        style={{
          width: "380px",
          boxShadow: open ? "0 0 10px rgba(0,0,0,0.2)" : "none",
          zIndex: 999,
          transform: open ? "translateX(0%)" : "translateX(100%)",
          // background: "var(--bg-main-2)",
          // color: "var(--color-main)",
          overflowY: "scroll",
          background: styles.COLOR_DARK_2,
          color: styles.COLOR_WHITE_1,
        }}
      >
        <div
          className="flex-none flex items-center"
          style={{
            height: "44px",
          }}
        >
          <div className="flex-1"></div>
          <HiX
            className="cursor-pointer"
            style={{
              width: "20px",
              height: "20px",
            }}
            onClick={() => setOpen(!open)}
          />
        </div>
        <div className="w-full flex flex-col flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center mt-12">
              <ImSpinner2
                className="animate-spin duration-[3s]"
                style={{
                  width: "32px",
                  height: "32px",
                }}
              />
            </div>
          ) : (
            conversationList.map((item) => (
              <ConversationItem
                key={item.id}
                data={item}
                active={currentConversationId === item.id}
              />
            ))
          )}
        </div>
      </div>
      <button
        className="flex items-center justify-center hover:opacity-80"
        style={{
          width: "50px",
          height: "40px",
          position: "fixed",
          top: "80px",
          right: "0",
          background: styles.COLOR_DARK_1,
          color: styles.COLOR_WHITE_1,
          cursor: "pointer",
          transform: open ? "translateX(100%)" : "translateX(0%)",
          transition: "transform 0.3s ease-out",
          outline: "none",
          border: "none",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        }}
        onClick={() => setOpen(!open)}
      >
        <BsClockHistory
          className=""
          style={{
            width: "20px",
            height: "20px",
          }}
        />
      </button>
    </div>
  );
}

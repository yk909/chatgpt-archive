import { Conversation } from "./types";
import { batchPromises } from "./utils";

export async function getAccessToken() {
  try {
    const res = await fetch("https://chat.openai.com/api/auth/session").then(
      (response) => response.json()
    );
    if (res.accessToken)
      return {
        accessToken: res.accessToken,
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        avatarUrl: res.user.picture,
      };
    console.warn("no access token from get access token:", res);
  } catch (err) {
    console.error("error getting access token:", err);
  }
  return null;
}

export async function fetch_conversations(offset, limit, order, token) {
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
}

export async function fetch_conversation_detail(conversationId, token) {
  return await fetch(
    `https://chat.openai.com/backend-api/conversation/${conversationId}`,
    {
      headers: {
        authorization: "Bearer " + token,
        "content-type": "application/json",
      },
      method: "GET",
    }
  ).then((response) => response.json());
}

export async function fetchAllConversationsGivenTotal(total_count, token) {
  const limit = 50;
  const page_count = Math.ceil(total_count / limit);
  const order = "updated";
  const promise_funcs = [];
  for (let i = 0; i < page_count; i++) {
    promise_funcs.push(() =>
      fetch_conversations(i * limit, limit, order, token)
    );
  }
  return batchPromises<{ items: Conversation[] }>(promise_funcs).then(
    (data) => {
      const all_conversations = [];
      data.forEach((d) => {
        all_conversations.push(...d.items);
      });
      return all_conversations;
    }
  );
}

export async function fetchAllConversations(token) {
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

export async function fetchNewConversations(token, currentLatestDate) {
  console.log("fetching new conversations......");
  const new_conversations = [];
  let data;
  let shouldStop = false;
  let offset = 0;
  const pageSize = 10;
  while (!shouldStop) {
    data = await fetch_conversations(offset, pageSize, "updated", token);
    data.items.forEach((c) => {
      if (shouldStop) return;
      const d = new Date(c.update_time);
      if (d > currentLatestDate) {
        new_conversations.push(c);
      } else {
        shouldStop = true;
      }
    });
    offset += pageSize;
  }
  console.log("done fetching latest conversations:", new_conversations);
  return new_conversations;
}

export async function fetchAllConversationsWithDetail(
  conversations: Conversation[],
  token: string,
  updateHandler: () => void
) {
  const promises = conversations.map((c) => {
    return () => {
      updateHandler();
      return fetch_conversation_detail(c.id, token);
    };
  });
  return batchPromises(promises);
}

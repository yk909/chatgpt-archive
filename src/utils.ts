import { Conversation } from "./types";
import { CHATGPT_DOMAIN_URL, styles } from "@src/constants";

export function formatDates(s: string): string {
  const date = new Date(s);
  return date
    .toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    })
    .replace(",", "");
}

export function getCurrentConversationId(): string {
  const conId = window.location.pathname.split("/")[2];
  return conId;
}

export async function batchPromises<T>(
  funcs: Array<() => Promise<T>>,
  limit = 5,
): Promise<T[]> {
  const results: T[] = [];
  const totalFuncs = funcs.length;

  let i = 0;

  while (i < totalFuncs) {
    const funcsBatch = funcs.slice(i, i + limit);
    i += limit;

    const batchResults = await Promise.all(funcsBatch.map((f) => f()));

    results.push(...batchResults);
  }

  return results;
}

export function categorizeConversations(
  conversations: Conversation[],
  byAttribute: keyof Conversation,
) {
  const result = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    "Previous 30 Days": [],
  };

  const currentMonth = new Date().getMonth();
  for (let i = 1; i <= currentMonth; i++) {
    result[
      new Date(new Date().getFullYear(), currentMonth - i, 1).toLocaleString(
        "default",
        { month: "long" },
      )
    ] = [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  conversations.forEach((article) => {
    const articleDate = new Date(article[byAttribute]);

    if (articleDate >= today) {
      result.Today.push(article);
    } else if (articleDate >= yesterday) {
      result.Yesterday.push(article);
    } else if (articleDate >= sevenDaysAgo) {
      result["Previous 7 Days"].push(article);
    } else if (articleDate >= thirtyDaysAgo) {
      result["Previous 30 Days"].push(article);
    } else {
      const month = articleDate.toLocaleString("default", { month: "long" });
      if (result[month]) {
        result[month].push(article);
      }
    }
  });

  return result;
}

export function extractConversationListFromPage() {
  const conTitleList = Array.from(
    document.querySelectorAll(
      "#__next > div.overflow-hidden.w-full.h-full.relative.flex.z-0 > div.dark.flex-shrink-0.overflow-x-hidden.bg-gray-900 > div > div > div > nav > div.flex-col.flex-1.transition-opacity.duration-500.overflow-y-auto.-mr-2 > div > div > span:nth-child(1) > div > ol > li > a > div",
    ),
  ).map((el: HTMLDivElement) => {
    return el.innerText;
  });
  return conTitleList;
}

export function loadConversation(conversationId: string) {
  window.location.href = `${CHATGPT_DOMAIN_URL}/c/${conversationId}`;
}

export async function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

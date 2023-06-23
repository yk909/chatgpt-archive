import { CHATGPT_DOMAIN_URL, styles } from "@src/constants";
import { Conversation } from "@src/types";
import { formatDates } from "@src/utils";
import React from "react";

export default function ConversationItem({
  data,
  active,
}: {
  data: Conversation;
  active: boolean;
}) {
  return (
    <a
      href={`${CHATGPT_DOMAIN_URL}/c/${data.id}`}
      className={
        "flex flex-col  rounded-lg gap-1 " +
        (active ? "bg-dark-1" : "hover:bg-card-hover")
      }
      style={{
        padding: styles.P_PAGE,
      }}
    >
      <div className="flex-none flex items-center w-full gap-3">
        <svg
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 "
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <div className="text-sm font-medium">{data.title}</div>
      </div>
      <div
        className="flex-col flex-1"
        style={{
          marginLeft: "28px",
        }}
      >
        <div
          className="text-gray-500"
          style={{
            fontSize: "12px",
          }}
        >
          Last update: {formatDates(data.update_time)}
        </div>
      </div>
    </a>
  );
}

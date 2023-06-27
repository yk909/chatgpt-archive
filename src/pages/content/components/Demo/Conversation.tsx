import { CHATGPT_DOMAIN_URL, styles } from "@src/constants";
import { Conversation } from "@src/types";
import { formatDates } from "@src/utils";
import React from "react";

export function Item({
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
        "flex rounded-lg gap-3 trans " +
        (active ? "bg-dark-1" : "hover:bg-card-hover")
      }
      style={{
        padding: styles.P_PAGE,
      }}
    >
      <div className="flex flex-none fcenter">
        <svg
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 "
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <div className="flex-col flex-1">
        <div
          className="text-sm font-medium"
          dangerouslySetInnerHTML={{ __html: data.title }}
        ></div>
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

export function List({
  data,
  currentId,
}: {
  data: Conversation[];
  currentId: string;
}) {
  return (
    <div
      className="flex flex-col flex-1 w-full con-list"
      style={{
        minHeight: 0,
        overflowY: "scroll",
      }}
    >
      {data.map((item) => (
        <Item key={item.id} data={item} active={currentId === item.id} />
      ))}
    </div>
  );
}

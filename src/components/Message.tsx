import React from "react";
import { CardContainer, CardContent, CardDescription, CardTitle } from "./Card";
import { MessageCircleIcon } from "./Icon";
import { loadConversation } from "@src/utils";

function getSnippet(content, keyword) {
  // Find the index of the first occurrence of the keyword in the content
  const keywordIndex = content.toLowerCase().indexOf(keyword.toLowerCase());

  // If the keyword is not found, return an empty string
  if (keywordIndex === -1) {
    return "";
  }

  // Calculate the start and end positions for the 60-character snippet
  const start = Math.max(0, keywordIndex - 30);
  const end = Math.min(content.length, keywordIndex + keyword.length + 30);

  // Extract the 60-character snippet
  const snippet = content.substring(start, end);

  return snippet;
}

export function MessageItem({
  message,
  keyword,
}: {
  message: Message;
  keyword: string;
}) {
  return (
    <CardContainer icon={<MessageCircleIcon size="sm" />}>
      <CardContent
        onClick={() => {
          loadConversation(message.conversation_id);
        }}
        className="cursor-pointer"
      >
        <CardTitle>{message.conversation_title}</CardTitle>
        <CardDescription>
          {getSnippet(message.contentStr, keyword)}
        </CardDescription>
      </CardContent>
    </CardContainer>
  );
}

import React from "react";
import { CardContainer, CardContent, CardTitle } from "@src/components/Card";
import { ConversationDetailPopover } from "@src/components/ConversationDetailPopover";
import { MoreDropdownButton } from "@src/pages/content/components/MoreDropdownButton";
import { AddToFolderDropdown } from "@src/pages/content/components/actions/AddToFolderDropdown";
import {
  TogglePinConversationButton,
  TogglePinConversationDropdown,
} from "@src/pages/content/components/actions/TogglePinConversation";
import { useConversation } from "@src/pages/content/hook";
import { loadConversation } from "@src/utils";
import { SelectionIcon } from "@src/components/Selection";
import { MessageIcon } from "@src/components/Icon";

const ConversationPresentor = React.memo(function ConversationCardPresentor({
  conversation,
  pinned,
  active,
  selected,
  toggle,
  selectionEnabled,
}: {
  conversation: Conversation;
  pinned: boolean;
  active: boolean;
  selected: boolean | null;
  toggle: (id: string) => void | null;
  selectionEnabled: boolean | null;
}) {
  console.log("render Conversation");
  return (
    <CardContainer
      icon={
        <SelectionIcon
          icon={<MessageIcon size="sm" />}
          selectionEnabled={selectionEnabled}
          toggle={toggle}
          id={conversation.id}
          selected={selected}
        />
      }
      props={{
        container: {
          "data-pin": pinned ? "true" : "false",
          "data-active": active ? "true" : "false",
          className: "conversation",
        },
      }}
      right={
        <>
          <div className="flex items-center flex-none gap-1">
            <ConversationDetailPopover
              conversation={conversation}
              className="opacity-0 card-hover-show icon-container icon-container-sm"
            />
            <div className="opacity-0 card-hover-show icon-container icon-container-sm">
              <TogglePinConversationButton conversationId={conversation.id} />
            </div>
            <MoreDropdownButton
              triggerClassName="opacity-0 card-hover-show"
              items={
                <>
                  <AddToFolderDropdown conversationIdList={[conversation.id]} />
                  <TogglePinConversationDropdown
                    conversationId={conversation.id}
                  />
                </>
              }
            />
          </div>
        </>
      }
      key={conversation.id}
    >
      <CardContent
        className="conversation-content"
        onClick={() => {
          console.log("click conversation");
          loadConversation(conversation.id);
        }}
      >
        <CardTitle>{conversation.title}</CardTitle>
      </CardContent>
    </CardContainer>
  );
});

export function ConversationItem({
  conversation,
  selected = null,
  toggle = null,
  selectionEnabled = null,
}: {
  conversation: Conversation;
  selected?: boolean;
  toggle?: (id: string) => void;
  selectionEnabled?: boolean;
}) {
  const { pinned, active } = useConversation(conversation.id);
  return (
    <ConversationPresentor
      conversation={conversation}
      selected={selected}
      toggle={toggle}
      pinned={pinned}
      active={active}
      selectionEnabled={selectionEnabled}
    />
  );
}

const ConversationPresentorWithoutSelect = React.memo(
  function ConversationCardPresentor({
    conversation,
    pinned,
    active,
  }: {
    conversation: Conversation;
    pinned: boolean;
    active: boolean;
  }) {
    console.log("render Conversation");
    return (
      <CardContainer
        icon={<MessageIcon size="sm" />}
        props={{
          container: {
            "data-pin": pinned ? "true" : "false",
            "data-active": active ? "true" : "false",
            className: "conversation",
          },
        }}
        right={
          <>
            <div className="flex items-center flex-none gap-1">
              <ConversationDetailPopover
                conversation={conversation}
                className="icon-container icon-container-sm"
              />
              <div className="icon-container icon-container-sm">
                <TogglePinConversationButton conversationId={conversation.id} />
              </div>
              <MoreDropdownButton
                items={
                  <>
                    <AddToFolderDropdown
                      conversationIdList={[conversation.id]}
                    />
                    <TogglePinConversationDropdown
                      conversationId={conversation.id}
                    />
                  </>
                }
              />
            </div>
          </>
        }
        key={conversation.id}
      >
        <CardContent
          className="conversation-content"
          onClick={() => {
            console.log("click conversation");
            loadConversation(conversation.id);
          }}
        >
          <CardTitle>{conversation.title}</CardTitle>
        </CardContent>
      </CardContainer>
    );
  }
);

export function ConversationItemWithoutSelect({
  conversation,
}: {
  conversation: Conversation;
}) {
  const { pinned, active } = useConversation(conversation.id);
  return (
    <ConversationPresentorWithoutSelect
      conversation={conversation}
      pinned={pinned}
      active={active}
    />
  );
}

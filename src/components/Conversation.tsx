import React from "react";
import { CardContainer, CardContent, CardTitle } from "@src/components/Card";
import { ConversationDetailOptionButton } from "@src/components/actions/ConversationDetailPopover";
import { MoreDropdownButton } from "@src/pages/content/components/MoreDropdownButton";
import { AddToFolderDropdown } from "@src/components/actions/AddToFolder";
import {
  TogglePinConversationOptionButton,
  TogglePinConversationDropdown,
} from "@src/components/actions/TogglePinConversation";
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
  optionButtons,
}: {
  conversation: Conversation;
  pinned: boolean;
  active: boolean;
  selected: boolean | null;
  toggle: (id: string) => void | null;
  selectionEnabled: boolean | null;
  optionButtons: ({
    conversation,
  }: {
    conversation: Conversation;
  }) => React.ReactNode;
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
      right={optionButtons({ conversation })}
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
  optionButtons = DefaultConversationOptions,
}: {
  conversation: Conversation;
  selected?: boolean;
  toggle?: (id: string) => void;
  selectionEnabled?: boolean;
  optionButtons?: ({
    conversation,
  }: {
    conversation: Conversation;
  }) => React.ReactNode;
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
      optionButtons={optionButtons}
    />
  );
}

const ConversationPresentorWithoutSelect = React.memo(
  function ConversationCardPresentor({
    conversation,
    pinned,
    active,
    optionButtons,
  }: {
    conversation: Conversation;
    pinned: boolean;
    active: boolean;
    optionButtons: ({
      conversation,
    }: {
      conversation: Conversation;
    }) => React.ReactNode;
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
        right={optionButtons({ conversation })}
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
  optionButtons = DefaultConversationOptions,
}: {
  conversation: Conversation;
  optionButtons?: ({
    conversation,
  }: {
    conversation: Conversation;
  }) => React.ReactNode;
}) {
  const { pinned, active } = useConversation(conversation.id);
  return (
    <ConversationPresentorWithoutSelect
      conversation={conversation}
      pinned={pinned}
      active={active}
      optionButtons={optionButtons}
    />
  );
}

export function DefaultConversationOptions({
  conversation,
}: {
  conversation: Conversation;
}) {
  return (
    <>
      <ConversationDetailOptionButton conversation={conversation} />
      <TogglePinConversationOptionButton conversationId={conversation.id} />
      <MoreDropdownButton>
        <AddToFolderDropdown conversationIdList={[conversation.id]} />
        <TogglePinConversationDropdown conversationId={conversation.id} />
      </MoreDropdownButton>
    </>
  );
}

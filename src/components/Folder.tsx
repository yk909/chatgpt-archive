import React from "react";
import {
  CardContainer,
  CardContent,
  CardDescription,
  CardTitle,
} from "@src/components/Card";
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
import { MessageSquare } from "lucide-react";
import {
  DeleteIcon,
  FolderIcon,
  MessageIcon,
  ToggleIcon,
} from "@src/components/Icon";
import { DeleteFromFolderDropdown } from "./actions/DeleteFromFolder";

const DeleteFromFolderButton = ({ folder }: { folder: Folder }) => {
  return <DeleteIcon className="icon-container icon-container-sm" />;
};

const ConversationPresentor = React.memo(function ConversationCardPresentor({
  conversation,
  folderId,
  pinned,
  active,
}: {
  conversation: Conversation;
  folderId: string;
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
          <ConversationDetailOptionButton conversation={conversation} />
          <TogglePinConversationOptionButton conversationId={conversation.id} />
          <MoreDropdownButton>
            <DeleteFromFolderDropdown
              conversationId={conversation.id}
              folderId={folderId}
            />
            <AddToFolderDropdown conversationIdList={[conversation.id]} />
            <TogglePinConversationDropdown conversationId={conversation.id} />
          </MoreDropdownButton>
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
  folderId,
}: {
  conversation: Conversation;
  folderId: string;
}) {
  const { pinned, active } = useConversation(conversation.id);
  return (
    <ConversationPresentor
      conversation={conversation}
      pinned={pinned}
      active={active}
      folderId={folderId}
    />
  );
}

const FolderPresentor = React.memo(function FolderCardPresentor({
  folder,
  selected,
  toggle,
  selectionEnabled,
}: {
  folder: Folder;
  selected: boolean | null;
  toggle: (id: string) => void | null;
  selectionEnabled: boolean | null;
}) {
  console.log("render Conversation");
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative flex flex-col flex-1 min-w-0">
      <CardContainer
        icon={
          <SelectionIcon
            icon={<FolderIcon size="sm" />}
            selectionEnabled={selectionEnabled}
            toggle={toggle}
            id={folder.id}
            selected={selected}
          />
        }
        right={
          <>
            <div className="flex items-center flex-none gap-1">
              {/* <FolderMoreButton folderId={data.id} /> */}
              <ToggleIcon onClick={() => setOpen((p) => !p)} open={open} />
            </div>
          </>
        }
      >
        <CardContent>
          <CardTitle>{folder.name}</CardTitle>
          <CardDescription>{`${folder.children.length} items`}</CardDescription>
        </CardContent>
      </CardContainer>

      <div
        className="animate-dynamic-h-container"
        data-open={open ? "true" : "false"}
      >
        <div className="flex flex-col ml-8 animate-dynamic-h-content">
          {folder.children.map((item) => (
            <ConversationItem
              key={item.id}
              conversation={item}
              folderId={folder.id}
              //   selected={selection.has(item.id)}
              //   toggle={toggle}
              //   selectionEnabled={selectionEnabled}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

export function FolderItem({
  folder,
  selected = null,
  toggle = null,
  selectionEnabled = null,
}: {
  folder: Folder;
  selected?: boolean;
  toggle?: (id: string) => void;
  selectionEnabled?: boolean;
}) {
  return (
    <FolderPresentor
      folder={folder}
      selected={selected}
      toggle={toggle}
      selectionEnabled={selectionEnabled}
    />
  );
}

export const FolderWithoutSelect = React.memo(function FolderCardPresentor({
  folder,
}: {
  folder: Folder;
}) {
  console.log("render folder");
  const [open, setOpen] = React.useState(false);
  return (
    <CardContainer
      icon={<FolderIcon size="sm" />}
      right={
        <>
          <div className="flex items-center flex-none gap-1">
            {/* <FolderMoreButton folderId={data.id} /> */}
            <ToggleIcon onClick={() => setOpen((p) => !p)} open={open} />
          </div>
        </>
      }
    >
      <CardContent>
        <CardTitle>{folder.name}</CardTitle>
        <CardDescription>{`${folder.children.length} items`}</CardDescription>
      </CardContent>
    </CardContainer>
  );
});

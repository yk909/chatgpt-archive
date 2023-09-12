import Panel from "./components/Panel";
import { Thumb } from "./components/Thumb";

import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { PANEL_NAV_ITEMS } from "./config";
import { useEffect } from "react";
import { init } from "./messages";
import { MESSAGE_ACTIONS } from "@src/constants";
import { useAtom } from "jotai";
import {
  bgResponseStatusAtom,
  conversationListAtom,
  folderListAtom,
  panelOpenAtom,
} from "./context";
import { useBgMessage, useKeyboardShortcut } from "./hook";

import { Toaster } from "@src/components/ui/toaster";
import { useToast } from "@src/components/ui/use-toast";
import { SuccessIcon } from "@src/components/Icon";

const router = createMemoryRouter([
  {
    path: "/",
    element: <Panel />,
    children: PANEL_NAV_ITEMS,
  },
]);

const KEYBOARD_SHORTCUTS_GLBOAL = [
  {
    name: "closePanel",
    keyCondition: (e: KeyboardEvent) => e.key === "Escape",
  },
  {
    name: "togglePanel",
    keyCondition: (e: KeyboardEvent) => e.ctrlKey && e.key === "k",
  },
];

const KEYBOARD_SHORTCUTS_NAME_TO_CONDITION = {
  closePanel: (e: KeyboardEvent) => e.key === "Escape",
  togglePanel: (e: KeyboardEvent) => e.ctrlKey && e.key === "k",
};

const KEYBOARD_SHORTCUTS_CONVERSATION = [
  {
    name: "gotoNextConversation",
    keyCondition: (e: KeyboardEvent) => e.ctrlKey && e.key === "ArrowDown",
  },
  {
    name: "gotoPreviousConversation",
    keyCondition: (e: KeyboardEvent) => e.ctrlKey && e.key === "ArrowUp",
  },
];

export default function App() {
  // define states

  // define functions

  // define effects
  const [responseStatus, setResponseStatus] = useAtom(bgResponseStatusAtom);
  const [folders, setFolders] = useAtom(folderListAtom);
  const [conversations, setConversations] = useAtom(conversationListAtom);
  const [open, setOpen] = useAtom(panelOpenAtom);
  const { toast } = useToast();

  useBgMessage({
    [MESSAGE_ACTIONS.RESPONSE_STATUS]: (request, sender, _) => {
      setResponseStatus(request.data);
      console.log("response status", request.data);
      if (request.data.status === "SUCCESS") {
        console.log("showing toast");
        toast({
          description: request.data.message,
          icon: <SuccessIcon />,
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [MESSAGE_ACTIONS.FETCH_FOLDERS]: (request, sender, _) => {
      setFolders(request.data);
    },
    [MESSAGE_ACTIONS.FETCH_CONVERSATIONS]: (request, sender, _) => {
      setConversations(request.data);
    },
  });

  const keyFunctions = {
    closePanel: () => {
      setOpen(() => false);
    },
    togglePanel: () => {
      setOpen((prev) => !prev);
    },
  };

  useKeyboardShortcut(
    Object.keys(keyFunctions).map((name) => ({
      name,
      keyCondition: KEYBOARD_SHORTCUTS_NAME_TO_CONDITION[name],
      callback: keyFunctions[name],
    }))
  );

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="content-view-container dark">
      <Thumb />
      <RouterProvider router={router} />
      <Toaster />
    </div>
  );
}

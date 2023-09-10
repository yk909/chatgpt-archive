import Panel from "./components/Panel";
import { Thumb } from "./components/Thumb";

import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { PANEL_NAV_ITEMS } from "./config";
import { useEffect } from "react";
import { init } from "./messages";
import { MESSAGE_ACTIONS } from "@src/constants";
import { useAtom } from "jotai";
import { bgResponseStatusAtom, folderListAtom } from "./context";

const router = createMemoryRouter([
  {
    path: "/",
    element: <Panel />,
    children: PANEL_NAV_ITEMS,
  },
]);

export default function App() {
  // define states

  // define functions

  // define effects
  const [responseStatus, setResponseStatus] = useAtom(bgResponseStatusAtom);
  const [folders, setFolders] = useAtom(folderListAtom);

  useEffect(() => {
    init();

    const handler = (request, sender, _) => {
      switch (request.type) {
        case MESSAGE_ACTIONS.RESPONSE_STATUS: {
          setResponseStatus(request.data);
          break;
        }
        case MESSAGE_ACTIONS.FETCH_FOLDERS: {
          setFolders(request.data);
          break;
        }
      }
    };

    chrome.runtime.onMessage.addListener(handler);

    return () => {
      chrome.runtime.onMessage.removeListener(handler);
    }
  }, []);

  return (
    <div className="content-view-container dark">
      <Thumb />
      <RouterProvider router={router} />
    </div>
  );
}

import { KeyboardShortcutItem, type MessageHandler } from "@src/types";
import { useEffect } from "react";

export function useBgMessage(eventMap: Record<string, MessageHandler>) {
  useEffect(() => {
    function handler(request, sender, sendResponse) {
      console.log("received bg message", request);
      const handler = eventMap[request.type];
      if (handler) {
        handler(request, sender, sendResponse);
      }
    }

    chrome.runtime.onMessage.addListener(handler);

    return () => {
      chrome.runtime.onMessage.removeListener(handler);
    };
  }, []);
}

export function useKeyboardShortcut(callbackMap: KeyboardShortcutItem[]) {
  useEffect(() => {
    const keydownListener = (e: KeyboardEvent) => {
      for (let i = 0; i < callbackMap.length; i++) {
        const shortcut = callbackMap[i];
        if (shortcut.keyCondition && shortcut.keyCondition(e)) {
          e.preventDefault();
          shortcut.callback();
          break;
        }
      }
    };

    document.addEventListener("keydown", keydownListener);

    return () => {
      document.removeEventListener("keydown", keydownListener);
    };
  }, []);
}

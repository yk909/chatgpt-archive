import { Conversation, Folder } from "@src/types";
import { atom, useAtom } from "jotai";

export const panelOpenAtom = atom<boolean>(false);
export const loadingAtom = atom<boolean>(false);
export const searchBoxOpenAtom = atom<boolean>(false);

export const oUserAtom = atom<any>(null);

export const conversationListAtom = atom<Conversation[]>([]);
export const folderListAtom = atom<Folder[]>([]);
export const displayConversationListAtom = atom<Conversation[]>([]);

export const selectionAtom = atom<Set<any>>(new Set());
export const selectionEnabledAtom = atom<boolean>(false);

export const pageAtom = atom<number>(1);

export const bgResponseStatusAtom = atom<{ status?: string; message?: string }>(
  {}
);

export function useSelection() {
  const [selection, setSelection] = useAtom(selectionAtom);
  const [conversations, setConversations] = useAtom(conversationListAtom);
  const [enabled, setEnabled] = useAtom(selectionEnabledAtom);

  function toggle(id: string) {
    setSelection((prev) => {
      const next = new Set(prev);
      if (selection.has(id)) {
        next.delete(id);
        if (next.size === 0) setEnabled(false);
      } else {
        if (next.size === 0) setEnabled(true);
        next.add(id);
      }
      return next;
    });
  }

  function isSelected(id: string) {
    return selection.has(id);
  }

  function clear() {
    setSelection(new Set());
    setEnabled(false);
  }

  function selectAll() {
    setSelection(new Set(conversations.map((c) => c.id)));
  }

  function disable() {
    clear();
    setEnabled(false);
  }

  return {
    selection,
    isSelected,
    toggle,
    clear,
    selectAll,
    enabled,
    disable,
  };
}

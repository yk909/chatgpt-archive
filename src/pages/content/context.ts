import { atom, useAtom } from "jotai";

export const panelOpenAtom = atom<boolean>(false);
export const loadingAtom = atom<boolean>(false);
export const searchOpenAtom = atom<boolean>(false);

export const oUserAtom = atom<any>(null);

export const conversationListAtom = atom<Conversation[]>([]);
export const folderListAtom = atom<Folder[]>([]);
export const displayConversationListAtom = atom<Conversation[]>([]);

export const bgResponseStatusAtom = atom<{ status?: string; message?: string }>(
  {}
);

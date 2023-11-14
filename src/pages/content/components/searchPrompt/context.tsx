import { atom } from "jotai";
import { SEARCH_TABS } from "./config";

export const SearchStateAtom = atom<{
  loading: boolean;
  result: SearchResult | null;
  query: string;
}>({
  loading: false,
  result: null,
  query: "",
});

export const SearchResultTabAtom = atom<keyof typeof SEARCH_TABS>("all");

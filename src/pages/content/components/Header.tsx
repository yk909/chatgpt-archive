import { useAtom } from "jotai";
import { panelOpenAtom, searchOpenAtom } from "../context";
import { refresh, refreshForce } from "../messages";
import { Moon, RotateCw, Search, Sun, X } from "lucide-react";
import { Switch } from "@src/components/ui/switch";
import { useState } from "react";
import { useRefresh } from "../hook";
import { shadowRoot } from "../root";
import {
  getDarkModeEnabledFromLocalStorage,
  setDarkModeEnabledToLocalStorage,
} from "../utils";
import { ForceRefreshIcon } from "@src/components/Icon";

function DarkModeSwitch() {
  console.log("render DarkModeSwitch", { shadowRoot });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return getDarkModeEnabledFromLocalStorage();
  });
  return (
    <div className="flex items-center gap-2">
      {darkMode ? <Moon className="icon-md" /> : <Sun className="icon-md" />}
      <Switch
        checked={darkMode}
        onCheckedChange={(value) => {
          setDarkModeEnabledToLocalStorage(value);
          setDarkMode(value);
          if (value) {
            shadowRoot.classList.add("dark");
          } else {
            shadowRoot.classList.remove("dark");
          }
        }}
      />
    </div>
  );
}

function RefreshButton() {
  const { refreshing, triggerRefresh } = useRefresh();

  function handleRefresh() {
    if (!refreshing) {
      triggerRefresh();
      refresh();
    }
  }

  return (
    <div
      className={
        "icon-container icon-container-md " + (refreshing ? "spinning" : "")
        // "icon-container icon-container-md"
      }
      onClick={handleRefresh}
    >
      <RotateCw />
    </div>
  );
}

function ForceRefreshButton() {
  const { refreshing, triggerRefresh } = useRefresh();

  function handleRefresh() {
    if (!refreshing) {
      triggerRefresh();
      refreshForce();
    }
  }

  return (
    <div
      className={
        "icon-container icon-container-md " + (refreshing ? "spinning" : "")
      }
      onClick={handleRefresh}
    >
      <ForceRefreshIcon />
    </div>
  );
}

export default function Header() {
  const [open, setOpen] = useAtom(panelOpenAtom);
  const [searchBoxOpen, setSearchBoxOpen] = useAtom(searchOpenAtom);

  return (
    <div
      className="flex items-center flex-none"
      style={{
        height: "var(--header-h)",
      }}
    >
      <RefreshButton />
      {/* <ForceRefreshButton /> */}
      <div
        className="icon-container icon-container-md"
        onClick={() => {
          setSearchBoxOpen(!searchBoxOpen);
        }}
      >
        <Search />
      </div>
      <div className="flex-1"></div>
      <div className="flex items-center gap-2">
        <DarkModeSwitch />
        <div
          className="icon-container icon-container-md"
          onClick={() => setOpen(!open)}
        >
          <X />
        </div>
      </div>
    </div>
  );
}

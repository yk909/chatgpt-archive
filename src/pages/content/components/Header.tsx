import { useAtom } from "jotai";
import { panelOpenAtom, searchOpenAtom } from "../context";
import { refresh } from "../messages";
import { Moon, RotateCw, Search, Sun, X } from "lucide-react";
import { Switch } from "@src/components/ui/switch";
import { useState } from "react";
import { useRefresh } from "../hook";
import { shadowRoot } from "../root";

function DarkModeSwitch() {
  console.log("render DarkModeSwitch", { shadowRoot });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return shadowRoot && shadowRoot.classList.contains("dark");
  });
  return (
    <div className="flex items-center gap-2">
      {darkMode ? <Moon className="icon-md" /> : <Sun className="icon-md" />}
      <Switch
        checked={darkMode}
        onCheckedChange={(value) => {
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

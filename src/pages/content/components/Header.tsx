import { styles } from "@src/constants";
import { useAtom } from "jotai";
import { loadingAtom, panelOpenAtom, searchBoxOpenAtom } from "../context";
import { refresh } from "../messages";
import { Moon, RotateCw, Search, Sun, X } from "lucide-react";
import { Switch } from "@src/components/ui/switch";
import { useState } from "react";

function DarkModeSwitch() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return document.querySelector("html")?.classList.contains("dark");
  });
  return (
    <div className="flex items-center gap-2">
      {darkMode ? <Moon className="icon-md" /> : <Sun className="icon-md" />}
      <Switch
        checked={darkMode}
        onCheckedChange={(value) => {
          setDarkMode(value);
          if (value) {
            document.querySelector("html").classList.add("dark");
          } else {
            document.querySelector("html").classList.remove("dark");
          }
        }}
      />
    </div>
  );
}

function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useAtom(loadingAtom);

  function handleRefresh() {
    if (!isRefreshing) {
      setIsRefreshing(true);
      refresh();
    }
  }

  return (
    <div
      className={
        // "icon-container icon-container-md " + (isRefreshing ? "spinning" : "")
        "icon-container icon-container-md"
      }
      onClick={handleRefresh}
    >
      <RotateCw />
    </div>
  );
}

export default function Header() {
  const [open, setOpen] = useAtom(panelOpenAtom);
  const [searchBoxOpen, setSearchBoxOpen] = useAtom(searchBoxOpenAtom);

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
          // setOpen(false);
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

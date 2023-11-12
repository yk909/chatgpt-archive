import { useAtom } from "jotai";
import { panelOpenAtom } from "../context";
import { cn } from "../../../lib/utils";
import Header from "./Header";
import BottomNavBar from "./BottomNavBar";
import { Outlet } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import { Spinner } from "@src/components/Spinner";
import { useRefresh } from "../hook";

export default function Panel() {
  const [open] = useAtom(panelOpenAtom);
  const { refreshing } = useRefresh();

  console.log("render Panel", { refreshing });

  return (
    <div
      className={cn(
        "fixed top-0 right-0 flex page-px flex-col h-screen overflow-hidden resize-x side-toggle-hover bg-background",
        open ? "open" : ""
      )}
      id="panel"
    >
      <Header />
      <ProgressBar />
      <div className="relative flex flex-col flex-1 min-h-0">
        {!refreshing ? <Outlet /> : <Spinner />}
      </div>
      {/* <BottomNavBar /> */}
    </div>
  );
}

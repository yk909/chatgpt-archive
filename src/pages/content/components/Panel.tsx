import { useAtom } from "jotai";
import { panelOpenAtom } from "../context";
import { cn } from "../../../lib/utils";
import Header from "./Header";
import BottomNavBar from "./BottomNavBar";
import { Outlet } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import { Spinner } from "@src/components/Spinner";
import { useRefresh } from "../hook";
import Footer from "./Footer";

export default function Panel() {
  const [open] = useAtom(panelOpenAtom);
  const { refreshing } = useRefresh();

  console.log("render Panel", { refreshing });

  return (
    <div
      className={cn(
        "flex page-px flex-col overflow-hidden side-toggle-hover bg-background",
        open ? "open" : ""
      )}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100vh",
        transform: open ? "translateX(0%)" : "translateX(100%)",
      }}
      id="panel"
    >
      <Header />
      <ProgressBar />
      <div className="relative flex flex-col flex-1 min-h-0">
        {!refreshing ? <Outlet /> : <Spinner />}
      </div>
      {/* <BottomNavBar /> */}
      <Footer />
    </div>
  );
}

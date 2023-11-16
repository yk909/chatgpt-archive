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
import CustomDialog from "@src/components/CustomDialog";

export default function Panel() {
  const [open] = useAtom(panelOpenAtom);
  const { refreshing } = useRefresh();

  console.log("render Panel", { refreshing });

  return (
    <CustomDialog
      className={"page-px flex-col overflow-hidden bg-background z-40"}
      open={open}
      duration={200}
      style={{
        position: "fixed",
        top: 0,
        height: "100vh",
        width: "400px",
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
    </CustomDialog>
  );
}

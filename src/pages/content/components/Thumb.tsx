import { BsClockHistory } from "react-icons/bs";
import { useAtom } from "jotai";
import { panelOpenAtom } from "../context";
import { SpinnerIcon } from "@src/components/Spinner";
import { useRefresh } from "../hook";
import { Logo } from "@src/components/Logo";

export function Thumb() {
  const [open, setOpen] = useAtom(panelOpenAtom);
  const { refreshing } = useRefresh();

  return (
    <div className="thumb" data-state={open ? "hidden" : "show"}>
      <div role="button" className="thumb-item" onClick={() => setOpen(!open)}>
        {refreshing ? (
          <SpinnerIcon size={20} />
        ) : (
          <BsClockHistory
            className=""
            style={{
              width: "20px",
              height: "20px",
            }}
          />
          // <Logo
          //   style={{
          //     width: "28px",
          //     height: "28px",
          //   }}
          // />
        )}
      </div>
    </div>
  );
}

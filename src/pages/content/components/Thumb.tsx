import { BsClockHistory } from "react-icons/bs";
import { useAtom } from "jotai";
import { loadingAtom, panelOpenAtom } from "../context";
import { SpinnerIcon } from "@src/components/Spinner";

export function Thumb() {
  const [open, setOpen] = useAtom(panelOpenAtom);
  const [loading] = useAtom(loadingAtom);

  return (
    <div>
      <button
        className="flex items-center justify-center hover:opacity-80 trans bg-background text-foreground"
        style={{
          width: "50px",
          height: "40px",
          position: "fixed",
          top: "80px",
          right: "0",
          cursor: "pointer",
          transform: open ? "translateX(100%)" : "translateX(0%)",
          transition: "all 0.3s ease-out",
          outline: "none",
          border: "none",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        }}
        onClick={() => setOpen(!open)}
      >
        {loading ? (
          <SpinnerIcon size={20} />
        ) : (
          <BsClockHistory
            className=""
            style={{
              width: "20px",
              height: "20px",
            }}
          />
        )}
      </button>
    </div>
  );
}

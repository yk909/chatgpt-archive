import React from "react";
import { styles } from "@src/constants";
import { BsClockHistory } from "react-icons/bs";
import { Spinner } from "./Loading";

export function Thumb({
  setOpen,
  open,
  loading,
}: {
  setOpen: (state: boolean) => void;
  open: boolean;
  loading: boolean;
}) {
  return (
    <div>
      <button
        className="flex items-center justify-center hover:opacity-80 trans"
        style={{
          width: "50px",
          height: "40px",
          position: "fixed",
          top: "80px",
          right: "0",
          background: styles.COLOR_DARK_1,
          color: styles.COLOR_WHITE_1,
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
          <Spinner
            style={{
              width: "20px",
              height: "20px",
            }}
          />
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

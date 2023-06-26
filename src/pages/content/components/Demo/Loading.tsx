import React from "react";
import { ImSpinner2 } from "react-icons/im";

export function Spinner({ style }: { style?: React.CSSProperties }) {
  return <ImSpinner2 className="animate-spin duration-[3s]" style={style} />;
}

export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center mt-12">
      <Spinner
        style={{
          width: "32px",
          height: "32px",
        }}
      />
    </div>
  );
}

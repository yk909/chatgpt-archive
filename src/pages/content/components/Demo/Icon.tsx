import React, { CSSProperties } from "react";

export function Container({
  style = {
    width: "36px",
    height: "36px",
  },
  children,
}: {
  style?: CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-full trans hover:bg-slate-100/20 fcenter"
      style={style}
    >
      {children}
    </div>
  );
}

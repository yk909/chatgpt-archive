import React, { CSSProperties } from "react";

export function Container({
  style = {
    width: "36px",
    height: "36px",
  },
  children,
  onClick,
}: {
  style?: CSSProperties;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className="rounded-full cursor-pointer trans hover:bg-slate-100/20 fcenter active:bg-slate-100/70"
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

import React from "react";
import { Check, MoreHorizontal, XSquare } from "lucide-react";

export function SelectionActionBar({ 
  enabled,
  handleClear,
  handleSelectAll
}: {
  enabled: boolean;
  handleClear: () => void;
  handleSelectAll: () => void;
}) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 items-center h-12 rounded-md bg-2 page-px page-mx trans flex"
      style={{
        opacity: enabled ? 1 : 0,
        zIndex: enabled ? "10" : "-10",
        transform: enabled ? "translateY(0)" : "translateY(100%)"
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="icon-container icon-container-sm"
          onClick={(e) => {
            e.preventDefault();
            handleSelectAll();
          }}
        >
          <Check />
        </div>
        <div
          className="icon-container icon-container-sm"
          onClick={(e) => {
            e.preventDefault();
            handleClear();
          }}
        >
          <XSquare />
        </div>
      </div>

      <div className="flex-1 min-w-0"></div>

      <div className="">
        <div className="icon-container icon-container-sm">
          <MoreHorizontal />
        </div> 
      </div>
    </div>
  );
}

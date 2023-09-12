import React from "react";
import { Check, MoreHorizontal, XSquare } from "lucide-react";

export function SelectionActionBar({
  enabled,
  left,
  right,
}: {
  enabled: boolean;
  left: () => React.ReactNode;
  right: () => React.ReactNode;
}) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 flex items-center h-12 rounded-md bg-2 page-px page-mx trans"
      style={{
        opacity: enabled ? 1 : 0,
        zIndex: enabled ? "999" : "-10",
        transform: enabled ? "translateY(0)" : "translateY(100%)",
      }}
    >
      <div className="flex items-center gap-2">{left()}</div>

      <div className="flex-1 min-w-0"></div>

      <div className="flex items-center gap-2">
        {right()}
        <div className="icon-container icon-container-sm">
          <MoreHorizontal />
        </div>
      </div>
    </div>
  );
}

export function SelectionAllButton({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="icon-container icon-container-sm"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      <Check />
    </div>
  );
}

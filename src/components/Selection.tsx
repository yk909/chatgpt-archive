import { atom, useAtom } from "jotai";
import { Checkbox } from "@src/components/ui/checkbox";

export function SelectionItem(
  { icon, selectionEnabled, selected, toggle, id, children }: {
    icon: React.ReactNode;
    selectionEnabled: boolean;
    selected: boolean;
    toggle: (id: string) => void;
    id: string;
    children: React.ReactNode;
  },
) {
  const handleToggle = (e) => {
    e.stopPropagation();
    toggle(id);
  };
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-none fcenter">
        {!selectionEnabled
          ? (
            <div className="relative group fcenter">
              <Checkbox
                id={id}
                checked={selected}
                className="relative z-10 opacity-0 group-hover:opacity-100"
                onClick={handleToggle}
              />
              {icon}
            </div>
          )
          : (
            <Checkbox
              id={id}
              checked={selected}
              onClick={handleToggle}
            />
          )}
      </div>
      {children}
    </div>
  );
}

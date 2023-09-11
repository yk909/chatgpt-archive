import { Conversation } from "@src/types";
import React from "react";

type SelectionType = Set<string>;

const SelectionContext = React.createContext<{
  selected: SelectionType;
  setSelected: React.Dispatch<React.SetStateAction<SelectionType>>;
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  enabled: boolean;
  reset: () => void;
}>({
  selected: new Set(),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSelected: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  isSelected: () => false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggle: () => {},
  enabled: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  reset: () => {},
});

export function useSelection() {
  return React.useContext(SelectionContext);
}

export function SelectionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selected, setSelected] = React.useState<SelectionType>(new Set());

  const isSelected = (id: string) => {
    return selected.has(id);
  };

  const toggle = (id: string) => {
    if (selected.has(id)) {
      console.log("toggle delete", id);
      selected.delete(id);
    } else {
      console.log("toggle add", id);
      selected.delete(id);
      selected.add(id);
    }
    setSelected(new Set(selected));
  };

  const enabled = selected.size > 0;

  const reset = () => {
    setSelected(new Set());
  };

  React.useEffect(() => {
    console.log("selected changed", selected);
  }, [selected]);

  return (
    <SelectionContext.Provider
      value={{ selected, setSelected, isSelected, toggle, enabled, reset }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

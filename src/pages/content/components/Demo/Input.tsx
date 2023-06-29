import React from "react";
import { Check } from "lucide-react";

export function CheckboxInput({
  id,
  label,
  checked = false,
  className = "",
  onClick,
}: {
  id: string;
  label?: string;
  checked: boolean;
  className?: string;
  onClick: (e: React.MouseEvent<HTMLInputElement>) => void;
}) {
  const ref = React.useRef();
  return (
    <div
      className={
        "relative flex items-center checkbox-container trans " + className
      }
    >
      <input
        ref={ref}
        type="checkbox"
        id={id}
        checked={checked}
        onClick={onClick}
      />
      <label htmlFor={id}>
        <Check className="checkmark" />
        {label && <span className="ml-2">{label}</span>}
      </label>
    </div>
  );
}

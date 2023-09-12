import { Check } from "lucide-react";

export function SuccessIcon() {
  return (
    <div className="flex items-center justify-center bg-green-600 rounded-full select-none w-7 h-7">
      <Check size={20} />
    </div>
  );
}

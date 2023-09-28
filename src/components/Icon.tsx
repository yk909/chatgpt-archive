import { Check, Folder, MessageSquare } from "lucide-react";

export function SuccessIcon() {
  return (
    <div className="flex items-center justify-center bg-green-600 rounded-full select-none w-7 h-7">
      <Check size={20} />
    </div>
  );
}

export function MessageIcon({ size }: { size: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
  };
  return (
    <MessageSquare
      className="flex-none mr-2"
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
      }}
    />
  );
}

export function FolderIcon({ size }: { size: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
  };
  return (
    <Folder
      className="flex-none mr-2"
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
      }}
    />
  );
}

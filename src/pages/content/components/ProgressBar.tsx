import React from "react";

export default function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-3 px-4 py-4 mb-4 rounded-lg bg-secondary">
      <div className="flex justify-between text-sm">
        <div className="">Downloading conversations...</div>
        <div>
          {`${current}/${total}`} {Math.round((current / total) * 100) + "%"}
        </div>
      </div>

      <div className="mb-1 h-[2px] w-full relative">
        <div
          className="absolute inset-y-0 left-0 z-10 bg-green-600"
          style={{
            right: `${100 - (current / total) * 100}%`,
          }}
        ></div>
        <div className="absolute inset-0"></div>
      </div>
    </div>
  );
}

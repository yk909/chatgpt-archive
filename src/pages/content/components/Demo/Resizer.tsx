import React, { useEffect } from "react";

const MIN_WIDTH = 360;

type WindowWithMouseDown = Window & {
  mouseDown: boolean;
};

declare let window: WindowWithMouseDown;

export function Resizer({ selector }: { selector: string }) {
  const [mouseDown, setMouseDown] = React.useState<boolean>(false);

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();

    // if (!mouseDown) return;
    if (!window.mouseDown) return;

    console.log("mouse move", window.mouseDown);

    const panel = document.querySelector(selector) as HTMLDivElement;
    const width = window.innerWidth - e.pageX;
    console.log("width", width);
    if (panel && width > MIN_WIDTH) {
      panel.style.width = `${width}px`;
    }
  };

  const handleMoseUp = () => {
    console.log("mouse up");
    setMouseDown(() => false);
    window.mouseDown = false;
  };

  const handleMouseDown = () => {
    console.log("mouse down");
    setMouseDown(() => true);
    window.mouseDown = true;
  };

  useEffect(() => {
    console.log("init resize");
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMoseUp);
    // document.addEventListener("mousedown", handleMouseDown);
    window.mouseDown = false;
  }, []);
  return (
    <div
      style={{
        width: "20px",
        height: "100%",
        position: "absolute",
        top: "0",
        left: "-10px",
        cursor: "ew-resize",
        background: "transparent",
      }}
      onMouseDown={handleMouseDown}
    ></div>
  );
}

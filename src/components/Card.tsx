import { cn } from "@src/lib/utils";
import React from "react";

export const CardContainer = React.memo(function CardContainer({
  icon,
  right = null,
  children,
  props = {
    container: {},
  },
}: {
  icon?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  props?: {
    container: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    > & { [key: `data-${string}`]: string };
  };
}) {
  const { className: containerClassName = "", ...containerProps } =
    props.container;
  return (
    <div
      className={"card " + containerClassName}
      {...containerProps}
      data-state="fi"
    >
      <div className="card-icon">{icon}</div>
      {children}
      <div className="card-right-container card-hover-show">
        <div className="card-right-before"></div>
        <div className="card-right">{right}</div>
      </div>
    </div>
  );
});

export function CardContent({
  className = "",
  children,
  ...props
}: { children: React.ReactNode } & React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("card-content", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
  ...titleProps
}: {
  children?: React.ReactNode;
} & React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={"card-title " + className} {...titleProps}>
      {children}
    </div>
  );
}

export function CardDescription({
  children,
  className = "",
  ...descriptionProps
}: {
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={"card-description " + className} {...descriptionProps}>
      {children}
    </div>
  );
}

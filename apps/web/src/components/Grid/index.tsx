import React from "react";

import clsx from "clsx";

export function Grid(props: React.ComponentProps<"div">) {
  const { children, className } = props;
  return (
    <div {...props} className={clsx("grid grid-flow-row gap-4", className)}>
      {children}
    </div>
  );
}

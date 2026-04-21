import React from "react";

import clsx from "clsx";

/* [
          classes.message,
          className,
          error && classes.error,
          success && classes.success,
          warning && classes.warning,
          !error && !success && !warning && classes.default,
        ]
          .filter(Boolean)
          .join(' '), */

export const Message: React.FC<{
  className?: string;
  error?: React.ReactNode;
  message?: React.ReactNode;
  success?: React.ReactNode;
  warning?: React.ReactNode;
}> = ({ className, error, message, success, warning }) => {
  const messageToRender = message || error || success || warning;
  console.log({ message, error, success, warning });
  if (messageToRender) {
    return (
      <div
        className={clsx(
          "p-4 max-w-lg mx-auto w-full my-8 rounded-lg text-xs/loose",
          {
            "bg-green-200 text-green-800": Boolean(success),
            " bg-yellow-200 text-yellow-800": Boolean(warning),
            "bg-red-200 text-red-800": Boolean(error),
          },
          className,
        )}
      >
        {messageToRender}
      </div>
    );
  }
  return null;
};

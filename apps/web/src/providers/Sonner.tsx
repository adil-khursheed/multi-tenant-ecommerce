"use client";

import { Toaster } from "sonner";

import { useTheme } from "@/providers/Theme";

export const SonnerProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { theme } = useTheme();

  return (
    <>
      {children}

      <Toaster richColors position="bottom-left" theme={theme || "light"} />
    </>
  );
};

"use client";

import React, { useCallback, useContext, useState } from "react";

import { LoginModal } from "@/components/LoginModal";

type LoginModalContextType = {
  openLoginModal: () => void;
};

const LoginModalContext = React.createContext<LoginModalContextType>({
  openLoginModal: () => {},
});

export const useLoginModal = () => useContext(LoginModalContext);

export const LoginModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);

  const openLoginModal = useCallback(() => {
    setOpen(true);
  }, []);

  return (
    <LoginModalContext.Provider value={{ openLoginModal }}>
      {children}
      <LoginModal open={open} onOpenChange={setOpen} />
    </LoginModalContext.Provider>
  );
};

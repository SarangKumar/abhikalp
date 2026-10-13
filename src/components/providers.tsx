"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import React from "react";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
};

export default Providers;

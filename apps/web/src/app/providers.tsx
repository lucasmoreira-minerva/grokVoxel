"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toast } from "@heroui/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toast.Provider placement="top end" maxVisibleToasts={4} />
    </NextThemesProvider>
  );
}

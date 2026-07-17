"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { useTheme } from "next-themes";

/** Compact light / dark / system control for the shell header. */
export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-8 w-[7.5rem] rounded-lg bg-overlay/40 animate-pulse" />
    );
  }

  const active = theme === "system" ? "system" : resolvedTheme;

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-xl border border-border bg-overlay/50 p-0.5"
      role="group"
      aria-label="Tema"
    >
      {(
        [
          { id: "light", label: "☀", title: "Claro" },
          { id: "dark", label: "☾", title: "Escuro" },
          { id: "system", label: "◎", title: "Sistema" },
        ] as const
      ).map((opt) => (
        <Button
          key={opt.id}
          size="sm"
          isIconOnly
          variant={active === opt.id ? "primary" : "ghost"}
          className="min-w-8 h-7 text-sm"
          aria-label={opt.title}
          onPress={() => setTheme(opt.id)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Button, Chip, Separator } from "@heroui/react";
import { ThemeSwitcher } from "./ThemeSwitcher";

const NAV = [
  { href: "/", label: "Projetos", icon: "▦", hint: "Lista de projetos" },
  { href: "/new", label: "Novo projeto", icon: "＋", hint: "Brief + skill" },
  { href: "/styles", label: "Estilos", icon: "✦", hint: "Skills / looks" },
  { href: "/music", label: "Música", icon: "♪", hint: "Beds royalty-free" },
  { href: "/voices", label: "Vozes", icon: "◎", hint: "Grok TTS" },
  { href: "/engine", label: "Motor", icon: "⌘", hint: "Grok Build CLI" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      <aside className="w-[252px] shrink-0 border-r border-border bg-surface/90 flex flex-col sticky top-0 h-screen backdrop-blur-xl z-40">
        <div className="px-4 py-5 border-b border-border">
          <Link href="/" className="flex items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/grokstage-mark.svg"
              alt=""
              className="h-10 w-10 rounded-xl shadow-md shadow-accent/20 group-hover:scale-[1.03] transition"
            />
            <div>
              <div className="font-bold tracking-tight text-[15px]">GrokStage</div>
              <div className="text-[10px] text-muted uppercase tracking-wider">
                SuperGrok · Director
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div className="px-2 py-2 text-[10px] uppercase tracking-widest text-muted font-semibold">
            Features
          </div>
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.hint}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition border ${
                  active
                    ? "bg-accent/15 text-accent border-accent/30 font-semibold shadow-sm"
                    : "text-muted hover:bg-overlay hover:text-foreground border-transparent"
                }`}
              >
                <span className="w-5 text-center opacity-90 text-base leading-none">
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-3">
          <div className="rounded-xl border border-border bg-overlay/50 p-3 flex items-center gap-3">
            <Avatar size="sm" className="bg-gradient-to-br from-sky-400 to-rose-400 shrink-0">
              <Avatar.Fallback className="text-xs font-bold text-black">
                D
              </Avatar.Fallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">Director</div>
              <div className="text-[11px] text-muted truncate">OAuth local</div>
            </div>
          </div>
          <ThemeSwitcher />
          <p className="text-[10px] text-center text-muted">
            Engine · Grok Build headless
          </p>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-border bg-surface/50 backdrop-blur-xl flex items-center justify-between px-5 sticky top-0 z-30 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Chip size="sm" variant="soft" color="accent">
              <Chip.Label>Storyboard-first</Chip.Label>
            </Chip>
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <span className="text-sm text-muted truncate hidden sm:inline">
              skills · SuperGrok CLI · HeroUI
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <ThemeSwitcher />
            </div>
            <Link href="/new">
              <Button size="sm" variant="primary">
                Novo projeto
              </Button>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-5 md:p-7 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

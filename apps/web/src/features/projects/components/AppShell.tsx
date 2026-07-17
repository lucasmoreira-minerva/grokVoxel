"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Projetos", icon: "▦" },
  { href: "/new", label: "Novo projeto", icon: "＋" },
  { href: "/styles", label: "Estilos / Skills", icon: "✦" },
  { href: "/music", label: "Música", icon: "♪" },
  { href: "/voices", label: "Vozes", icon: "◎" },
  { href: "/engine", label: "Motor Grok", icon: "⌘" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      {/* Sidebar */}
      <aside className="w-[240px] shrink-0 border-r border-[var(--border)] bg-[#0a0e13]/95 flex flex-col sticky top-0 h-screen">
        <div className="px-4 py-5 border-b border-[var(--border)]">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/grokstage-mark.svg"
              alt=""
              className="h-10 w-10 rounded-xl shadow-lg shadow-violet-900/40"
            />
            <div>
              <div className="font-bold tracking-tight text-[15px]">GrokStage</div>
              <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">
                SuperGrok · Director
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-2 py-2 text-[10px] uppercase tracking-widest text-[var(--muted)]">
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
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-sky-500/15 text-sky-200 border border-sky-500/30"
                    : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--text)] border border-transparent"
                }`}
              >
                <span className="w-5 text-center opacity-80">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[var(--border)]">
          <div className="rounded-xl border border-[var(--border)] bg-black/30 p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-400 to-rose-400 flex items-center justify-center text-xs font-bold text-black">
              U
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">Director</div>
              <div className="text-[11px] text-[var(--muted)] truncate">
                SuperGrok OAuth local
              </div>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-center text-[var(--muted)]">
            Engine: Grok Build headless
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-[var(--border)] bg-black/20 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="text-sm text-[var(--muted)]">
            Storyboard-first · skills como estilos · CLI SuperGrok
          </div>
          <Link href="/new" className="btn btn-primary text-sm">
            Novo projeto
          </Link>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

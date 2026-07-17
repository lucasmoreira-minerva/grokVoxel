import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { AppShell } from "@/features/projects/components/AppShell";

export const metadata: Metadata = {
  title: "GrokStage — SuperGrok Video Director",
  description:
    "Storyboard-first video director powered by SuperGrok / Grok Build headless",
  icons: { icon: "/grokstage-mark.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}

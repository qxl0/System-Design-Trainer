import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "System Design Assist",
  description:
    "Practice system design interviews with guided prompts, AI feedback, and review planning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <div className="page-shell">
          <header className="border-b border-white/10 bg-black/20 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link
                href="/"
                className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] text-white"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-200 shadow-[0_0_40px_rgba(34,211,238,0.18)]">
                  SD
                </span>
                <span>System Design Assist</span>
              </Link>

              <nav className="flex items-center gap-3 text-sm text-slate-300">
                <Link
                  href="/"
                  className="rounded-full px-4 py-2 transition hover:bg-white/5 hover:text-white"
                >
                  Overview
                </Link>
                <a
                  href="#workflow"
                  className="rounded-full px-4 py-2 transition hover:bg-white/5 hover:text-white"
                >
                  Workflow
                </a>
                <a
                  href="#roadmap"
                  className="rounded-full px-4 py-2 transition hover:bg-white/5 hover:text-white"
                >
                  Build Plan
                </a>
              </nav>
            </div>
          </header>

          {children}
        </div>
      </body>
    </html>
  );
}

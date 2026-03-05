import type { Metadata } from "next";
import { GeistMono } from 'geist/font/mono';
import Script from "next/script";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "PushUp Tracker",
  description: "Track your pushups with friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={GeistMono.variable} suppressHydrationWarning>
      <body>
        {/* Prevent FOUC: set dark class before first paint */}
        <Script id="theme-init" strategy="beforeInteractive" src="/theme-init.js" />
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}

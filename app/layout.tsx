import type { Metadata } from "next";
import { GeistMono } from 'geist/font/mono';
import Script from "next/script";
import "./globals.css";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,400,1,-25&display=block" rel="stylesheet" />
      </head>
      <body>
        {/* Prevent FOUC: set dark class before first paint */}
        <Script id="theme-init" strategy="beforeInteractive" src="/theme-init.js" />
        {children}
      </body>
    </html>
  );
}

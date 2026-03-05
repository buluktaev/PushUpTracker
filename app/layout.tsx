import type { Metadata } from "next";
import { GeistMono } from 'geist/font/mono';
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
    <html lang="ru" className={GeistMono.variable}>
      <body>{children}</body>
    </html>
  );
}

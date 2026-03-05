import type { Metadata } from "next";
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

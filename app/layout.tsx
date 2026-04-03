import type { Metadata } from "next";
import AgentationRuntime from "@/components/AgentationRuntime";
import AppToaster from "@/components/AppToaster";
import ThemeRuntime from "@/components/ThemeRuntime";
import "./globals.css";

export const metadata: Metadata = {
  title: "PushUp Tracker",
  description: "Командный трекер отжиманий с автосчётом через камеру",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PushUp Tracker",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInitScript = `
    try {
      var t = localStorage.getItem('theme');
      if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  `;

  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;700&display=swap"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeRuntime />
        <AgentationRuntime />
        {children}
        <AppToaster />
      </body>
    </html>
  );
}

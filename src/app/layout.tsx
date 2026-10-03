import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Roboto_Flex } from "next/font/google";
import type { ReactNode } from "react";
import { site } from "@/content/site";
import "./globals.css";

const sans = Roboto_Flex({
  subsets: ["latin", "cyrillic"],
  axes: ["opsz"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "700"],
  variable: "--font-mono",
  display: "swap",
});

const { title, description, url, locale } = site.meta;

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  applicationName: site.header.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: site.header.name, title, description, locale },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#0d0907",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${sans.variable} ${mono.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

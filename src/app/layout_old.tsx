import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";

const josefinSans = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";

const josefinSans = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: process.env.WEBSITE_TITLE || "Your Portfolio - Full-stack Developer",
    description: process.env.WEBSITE_DESCRIPTION || "Full-stack developer specializing in modern web technologies with startup and open-source experience.",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const iconUrl = process.env.WEBSITE_ICON_URL;
  
  return (
    <html lang="en" className="dark">
      <head>
        {iconUrl ? (
          <>
            <link rel="icon" href={iconUrl} type="image/png" />
            <link rel="shortcut icon" href={iconUrl} type="image/png" />
            <link rel="apple-touch-icon" href={iconUrl} />
          </>
        ) : (
          <>
            <link rel="icon" href="/api/favicon" type="image/png" />
            <link rel="shortcut icon" href="/api/favicon" type="image/png" />
            <link rel="apple-touch-icon" href="/api/apple-touch-icon" />
          </>
        )}
      </head>
      <body
        className={`${josefinSans.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}

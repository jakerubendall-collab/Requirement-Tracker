import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { brandConfig } from "@/lib/config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: `${brandConfig.portalName} | ${brandConfig.firmName}`,
  description: `${brandConfig.tagline} — ${brandConfig.location}`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-[#f8f9fb] text-gray-900 antialiased">{children}</body>
    </html>
  );
}

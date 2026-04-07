import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import FloatingElements from "@/components/FloatingElements";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-headline",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEON RELIC | CardPack NFT",
  description: "Buy and open NFT card packs on Sepolia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} dark`}
    >
      <body className="min-h-screen bg-background text-foreground font-[var(--font-body)] overflow-x-hidden selection:bg-neon-cyan selection:text-on-primary">
        <div className="fixed inset-0 z-[100] noise-overlay" />
        <Providers>
          <TopNav />
          {children}
          <BottomNav />
          <FloatingElements />
        </Providers>
      </body>
    </html>
  );
}

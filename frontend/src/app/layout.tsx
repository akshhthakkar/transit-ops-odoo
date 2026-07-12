import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const interMono = JetBrains_Mono({
  variable: "--font-inter-mono",
  subsets: ["latin"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Swift — Smart Transport Operations",
  description:
    "Swift is a smart transport operations platform for managing fleets, drivers, trips, maintenance, fuel, expenses, and analytics.",
  keywords: [
    "Swift",
    "fleet management",
    "transport operations",
    "logistics",
    "ERP",
  ],
  authors: [{ name: "Swift" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${interMono.variable} ${bricolage.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster />
        <SonnerToaster position="bottom-right" />
      </body>
    </html>
  );
}

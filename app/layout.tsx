import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HumanizeAI — Bypass GPTZero, ZeroGPT & Turnitin",
  description:
    "Transform AI-generated text into naturally human writing. Our AI humanizer bypasses GPTZero, ZeroGPT, and Turnitin with 95%+ success rate.",
  keywords: ["ai humanizer", "bypass gptzero", "bypass turnitin", "bypass zerogpt", "ai text humanizer", "humanize ai text"],
  openGraph: {
    title: "HumanizeAI — Bypass GPTZero, ZeroGPT & Turnitin",
    description: "Transform AI-generated text into naturally human writing.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

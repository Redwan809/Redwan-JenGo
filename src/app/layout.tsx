import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { PT_Sans } from 'next/font/google';
import { cn } from "@/lib/utils";
import "./globals.css";


export const metadata: Metadata = {
  title: "Redwan Intel AI Chat",
  description: "An AI chat application by Redwan.",
  manifest: "/manifest.json",
};

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", ptSans.variable)}>
      <head />
      <body className="font-body antialiased">{children}<Toaster /></body>
    </html>
  );
}

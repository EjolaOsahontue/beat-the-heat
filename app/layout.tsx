import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/lib/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KAVALI | Premium Streetwear",
  description: "Luxury apparel for the bold. High-end streetwear designed in Lagos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="bg-white text-black min-h-screen selection:bg-black selection:text-white">

        <AuthProvider>
          <Navbar />

          {/* Page Content */}
          <main className="pt-20 min-h-screen">
            {children}
          </main>

        </AuthProvider>

        {/* Paystack Script */}
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="beforeInteractive"
        />

      </body>
    </html>
  );
}
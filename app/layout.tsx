import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

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
  title: "BTH +",
  description: "BTH APPARELS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="bg-white text-black min-h-screen selection:bg-black selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="pt-20 min-h-screen">{children}</main>
        </AuthProvider>

        {/* Flutterwave */}
        <Script
          src="https://checkout.flutterwave.com/v3.js"
          strategy="beforeInteractive"
        />
        {/* Paystack */}
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="beforeInteractive"
        />
        <Analytics />
      </body>
    </html>
  );
}
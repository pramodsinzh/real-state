import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
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
  title: {
    default: "Rentiful | Find Your Perfect Rental Home",
    template: "%s | Rentiful",
  },
  description:
    "Discover your perfect rental apartment with Rentiful's advanced search. Browse verified listings, connect with property managers, and find a home that fits your lifestyle.",
  keywords: [
    "rental",
    "apartments",
    "property rental",
    "rent apartment",
    "rental listings",
    "property management",
  ],
  openGraph: {
    title: "Rentiful | Find Your Perfect Rental Home",
    description:
      "Discover your perfect rental apartment with Rentiful's advanced search and verified listings.",
    siteName: "Rentiful",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rentiful | Find Your Perfect Rental Home",
    description:
      "Discover your perfect rental apartment with Rentiful's advanced search and verified listings.",
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <Toaster closeButton />
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://cron-expression-builder.vercel.app";

export const metadata: Metadata = {
  title: "Cron Expression Builder",
  description:
    "Visual cron expression builder and validator. Create, edit, and understand cron schedules with an interactive UI, next execution times, calendar view, and timezone support.",
  keywords: [
    "cron",
    "cron expression",
    "cron builder",
    "cron generator",
    "cron schedule",
    "crontab",
    "cron validator",
    "cron parser",
  ],
  authors: [{ name: "Cron Expression Builder" }],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Cron Expression Builder",
    description:
      "Visual cron expression builder and validator. Create, edit, and understand cron schedules with an interactive UI.",
    url: siteUrl,
    siteName: "Cron Expression Builder",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cron Expression Builder",
    description:
      "Visual cron expression builder and validator. Create, edit, and understand cron schedules with an interactive UI.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Cron Expression Builder",
    url: siteUrl,
    description:
      "Visual cron expression builder and validator. Create, edit, and understand cron schedules with an interactive UI, next execution times, calendar view, and timezone support.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

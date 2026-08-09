import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";

import { GlobalProviders } from "../providers/global";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Atelier — Forms people actually want to fill out",
    template: "%s · Atelier",
  },
  description:
    "Create beautiful forms that feel like part of your brand, not another boring questionnaire.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} antialiased`}>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}

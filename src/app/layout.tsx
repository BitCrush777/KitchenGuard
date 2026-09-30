import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KitchenGuard — Hands-Free Voice Food Safety System",
  description: "Hands-free, voice-native food-safety inspection system for commercial kitchens.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="font-sans bg-surface text-on-surface antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}

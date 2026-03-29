import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TLSG - The Last Study Guide",
  description: "An ocean of learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-900 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}

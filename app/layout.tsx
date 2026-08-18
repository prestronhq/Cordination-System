import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lira District Sector Coordination Platform",
  description: "Official sector coordination and public information platform for Lira District, Uganda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

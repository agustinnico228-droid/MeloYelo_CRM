import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MeloYelo CRM Hub",
    template: "%s · MeloYelo CRM Hub",
  },
  description: "One place for MeloYelo leads, pipeline and reporting.",
};

export const viewport: Viewport = {
  themeColor: "#ffde00",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${heebo.variable} antialiased`}>{children}</body>
    </html>
  );
}

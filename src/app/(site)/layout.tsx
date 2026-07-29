import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import localFont from "next/font/local";
import "../globals.css";

/**
 * Root layout for the hub itself. The (payload) group is a SIBLING root
 * layout — Payload's admin renders its own <html>, so nesting it under
 * a shared root layout produces html-inside-body hydration errors.
 */

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// Bikys Heading — the meloyelo.nz display face (weight 700 only, served
// from the site's own theme). Heebo 700 remains the fallback in the stack.
const bikys = localFont({
  src: "../../../public/fonts/Bikys-Bold.woff2",
  weight: "700",
  variable: "--font-bikys",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MeloYelo CRM Hub",
    template: "%s - MeloYelo CRM Hub",
  },
  description: "One place for MeloYelo leads, pipeline and reporting.",
};

export const viewport: Viewport = {
  // The site's chrome is black (header/footer bars) with yellow accents.
  themeColor: "#000000",
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
      <body className={`${heebo.variable} ${bikys.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Noto_Serif, Manrope } from "next/font/google";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import "./globals.css";

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf9f8",
};

export const metadata: Metadata = {
  title: {
    default: "Layana Boutique — Premium Fashion House",
    template: "%s | Layana Boutique",
  },
  description: "Layana Boutique — curating the future of conscious luxury fashion.",
  openGraph: {
    title: "Layana Boutique",
    description: "Layana Boutique — curating the future of conscious luxury fashion.",
    siteName: "Layana Boutique",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notoSerif.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

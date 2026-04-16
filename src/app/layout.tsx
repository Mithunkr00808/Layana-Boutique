import type { Metadata, Viewport } from "next";
import { Noto_Serif, Manrope, Geist } from "next/font/google";
import AppProviders from "@/components/AppProviders";
import ConditionalFooter from "@/components/ConditionalFooter";
import FooterWithData from "@/components/FooterWithData";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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

const BASE_URL = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Layana Boutique — Designer Sarees, Kurties & Kids Wear Online",
    template: "%s | Layana Boutique",
  },
  description:
    "Shop luxury designer sarees, premium kurties and ethnic kids wear at Layana Boutique. Handpicked Indian fashion with artisanal craftsmanship. Free shipping across India.",
  keywords: [
    "designer sarees online",
    "buy sarees online India",
    "premium kurties",
    "luxury Indian fashion",
    "kids ethnic wear",
    "handloom sarees",
    "silk sarees online",
    "linen kurties",
    "festive kids wear",
    "layana boutique",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "Layana Boutique",
    title: "Layana Boutique — Designer Sarees, Kurties & Kids Wear",
    description:
      "Shop luxury designer sarees, premium kurties and ethnic kids wear. Handpicked Indian fashion with artisanal craftsmanship.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Layana Boutique — Designer Sarees, Kurties & Kids Wear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Layana Boutique — Designer Sarees, Kurties & Kids Wear",
    description:
      "Shop luxury designer sarees, premium kurties and ethnic kids wear at Layana Boutique.",
    images: ["/opengraph-image"],
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
      className={cn("h-full", "antialiased", notoSerif.variable, manrope.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>
          <div className="flex-1 flex flex-col">{children}</div>
          <ConditionalFooter>
            <FooterWithData />
          </ConditionalFooter>
        </AppProviders>
      </body>
    </html>
  );
}

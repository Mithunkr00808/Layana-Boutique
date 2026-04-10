import type { Metadata, Viewport } from "next";
import { Noto_Serif, Manrope, Geist } from "next/font/google";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import ConditionalFooter from "@/components/ConditionalFooter";
import FooterWithData from "@/components/FooterWithData";
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
      className={cn("h-full", "antialiased", notoSerif.variable, manrope.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <ConditionalFooter>
            <FooterWithData />
          </ConditionalFooter>
        </AuthProvider>
      </body>
    </html>
  );
}

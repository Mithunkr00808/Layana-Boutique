import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function manifest(): MetadataRoute.Manifest {
  const siteUrl = getSiteUrl();

  return {
    name: "Layana Boutique",
    short_name: "Layana",
    description:
      "Designer sarees, premium kurties and ethnic kids wear curated by Layana Boutique.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbf9f8",
    theme_color: "#fbf9f8",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
    id: siteUrl,
  };
}


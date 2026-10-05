import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { theme } from "@/content/theme";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.meta.title,
    short_name: site.header.name,
    description: site.meta.description,
    start_url: "/",
    display: "standalone",
    background_color: theme.background,
    theme_color: theme.background,
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}

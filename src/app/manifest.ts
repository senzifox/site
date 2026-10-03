import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.meta.title,
    short_name: site.header.name,
    description: site.meta.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0d0907",
    theme_color: "#0d0907",
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}

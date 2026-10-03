import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site.meta.url, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}

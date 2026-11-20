import type { MetadataRoute } from "next";
import { siteManifest } from "@/lib/manifest";

export default function manifest(): MetadataRoute.Manifest {
  return siteManifest("ru");
}

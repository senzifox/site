import type { Metadata } from "next";
import { Background } from "@/components/Background/Background";
import { NotFound as NotFoundCard } from "@/components/NotFound/NotFound";
import { sites } from "@/content/sites";

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Background />
      <NotFoundCard texts={{ ru: sites.ru.notFound, en: sites.en.notFound }} />
    </>
  );
}

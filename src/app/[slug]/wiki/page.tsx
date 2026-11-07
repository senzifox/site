import { WikiPage, type WikiProps, wikiMetadata, wikiStaticParams } from "./WikiPage";

export const revalidate = 900;

export const generateStaticParams = () => wikiStaticParams("ru");

export const generateMetadata = async ({ params }: WikiProps) => wikiMetadata((await params).slug, "ru");

export default async function RuWikiPage({ params }: WikiProps) {
  return <WikiPage slug={(await params).slug} lang="ru" />;
}

import { WikiPage, type WikiProps, wikiMetadata, wikiStaticParams } from "../WikiPage";

export const revalidate = 900;

export const generateStaticParams = () => wikiStaticParams("en");

export const generateMetadata = async ({ params }: WikiProps) => wikiMetadata((await params).slug, "en");

export default async function EnWikiPage({ params }: WikiProps) {
  return <WikiPage slug={(await params).slug} lang="en" />;
}

import { ProjectPage, type ProjectProps, projectMetadata, projectStaticParams } from "../ProjectPage";

export const revalidate = 900;

export const generateStaticParams = () => projectStaticParams("en");

export const generateMetadata = async ({ params }: ProjectProps) =>
  projectMetadata((await params).slug, "en");

export default async function EnProjectPage({ params }: ProjectProps) {
  return <ProjectPage slug={(await params).slug} lang="en" />;
}

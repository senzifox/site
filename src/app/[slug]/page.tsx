import { ProjectPage, type ProjectProps, projectMetadata, projectStaticParams } from "./ProjectPage";

export const revalidate = 900;

export const generateStaticParams = () => projectStaticParams("ru");

export const generateMetadata = async ({ params }: ProjectProps) =>
  projectMetadata((await params).slug, "ru");

export default async function RuProjectPage({ params }: ProjectProps) {
  return <ProjectPage slug={(await params).slug} lang="ru" />;
}

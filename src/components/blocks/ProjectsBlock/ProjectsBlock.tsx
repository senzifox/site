import Link from "next/link";
import { LabeledCard } from "@/components/Card/Card";
import { Icon } from "@/components/Icon/Icon";
import { ProjectIcon } from "@/components/ProjectIcon/ProjectIcon";
import type { Lang, ProjectsBlock as Props } from "@/content/types";
import { getProjectsOrNone, projectDescription, projectPathIn } from "@/lib/github/projects";
import styles from "./ProjectsBlock.module.css";

export async function ProjectsBlock({ label, lang }: Props & { lang: Lang }) {
  const projects = await getProjectsOrNone();
  if (projects.length === 0) return null;

  return (
    <LabeledCard label={label}>
      <ul className={styles.list}>
        {projects.map((project) => {
          const { slug, name, icon } = project;
          const description = projectDescription(project, lang);
          return (
            <li key={slug}>
              <Link className={styles.row} href={projectPathIn(project, lang)}>
                <ProjectIcon name={name} src={icon} />
                <span className={styles.body}>
                  <span className={styles.name}>{name}</span>
                  {description && <span className={styles.summary}>{description}</span>}
                </span>
                <Icon name="chevronRight" size={20} className={styles.chevron} />
              </Link>
            </li>
          );
        })}
      </ul>
    </LabeledCard>
  );
}

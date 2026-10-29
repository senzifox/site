import Link from "next/link";
import { LabeledCard } from "@/components/Card/Card";
import { Icon } from "@/components/Icon/Icon";
import { ProjectIcon } from "@/components/ProjectIcon/ProjectIcon";
import type { ProjectsBlock as Props } from "@/content/types";
import { getProjectsOrNone } from "@/lib/github/projects";
import styles from "./ProjectsBlock.module.css";

export async function ProjectsBlock({ label }: Props) {
  const projects = await getProjectsOrNone();
  if (projects.length === 0) return null;

  return (
    <LabeledCard label={label}>
      <ul className={styles.list}>
        {projects.map(({ slug, name, description, icon }) => (
          <li key={slug}>
            <Link className={styles.row} href={`/${slug}`}>
              <ProjectIcon name={name} src={icon} />
              <span className={styles.body}>
                <span className={styles.name}>{name}</span>
                {description && <span className={styles.summary}>{description}</span>}
              </span>
              <Icon name="chevronRight" size={20} className={styles.chevron} />
            </Link>
          </li>
        ))}
      </ul>
    </LabeledCard>
  );
}

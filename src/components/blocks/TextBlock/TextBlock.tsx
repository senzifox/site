import { LabeledCard } from "@/components/Card/Card";
import type { TextBlock as Props } from "@/content/types";
import styles from "./TextBlock.module.css";

export function TextBlock({ title, text }: Props) {
  const body = text?.trim();

  if (!title?.trim() && !body) return null;

  return <LabeledCard label={title}>{body && <p className={styles.text}>{body}</p>}</LabeledCard>;
}

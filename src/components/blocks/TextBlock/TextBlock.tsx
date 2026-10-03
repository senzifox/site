import { useId } from "react";
import { Card } from "@/components/Card/Card";
import type { TextBlock as Props } from "@/content/types";
import styles from "./TextBlock.module.css";

export function TextBlock({ title, text }: Props) {
  const titleId = useId();
  const heading = title?.trim();
  const body = text?.trim();

  if (!heading && !body) return null;

  return (
    <Card className={styles.card} aria-labelledby={heading ? titleId : undefined}>
      {heading && (
        <h2 id={titleId} className={styles.title}>
          {heading}
        </h2>
      )}
      {body && <p className={styles.text}>{body}</p>}
    </Card>
  );
}

import { useId } from "react";
import { Card } from "@/components/Card/Card";
import type { StatusBlock as Props } from "@/content/types";
import styles from "./StatusBlock.module.css";

export function StatusBlock({ label, text, state = "online" }: Props) {
  const labelId = useId();
  const heading = label?.trim();
  const body = text?.trim();

  if (!body) return null;

  return (
    <Card className={styles.card} aria-labelledby={heading ? labelId : undefined}>
      {heading && (
        <span id={labelId} className={styles.label}>
          {heading}
        </span>
      )}
      <span className={styles.row}>
        <span className={`${styles.dot} ${styles[state]}`} aria-hidden="true" />
        <span className={styles.text}>{body}</span>
      </span>
    </Card>
  );
}

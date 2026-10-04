import { useId } from "react";
import { Card } from "@/components/Card/Card";
import type { CodeBlock as Props } from "@/content/types";
import styles from "./CodeBlock.module.css";

export function CodeBlock({ label, lines }: Props) {
  const labelId = useId();
  const heading = label?.trim();
  const rows = lines.map((line) => line.replace(/\s+$/, ""));

  if (!rows.some((line) => line.length > 0)) return null;

  return (
    <Card className={styles.card} aria-labelledby={heading ? labelId : undefined}>
      {heading && (
        <span id={labelId} className={styles.label}>
          {heading}
        </span>
      )}
      <pre className={styles.pre}>
        <code>{rows.join("\n")}</code>
      </pre>
    </Card>
  );
}

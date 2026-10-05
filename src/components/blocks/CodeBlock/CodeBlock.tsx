import { LabeledCard } from "@/components/Card/Card";
import type { CodeBlock as Props } from "@/content/types";
import styles from "./CodeBlock.module.css";

export function CodeBlock({ label, lines }: Props) {
  const rows = lines.map((line) => line.replace(/\s+$/, ""));

  if (!rows.some((line) => line.length > 0)) return null;

  return (
    <LabeledCard label={label}>
      <pre className={styles.pre}>
        <code>{rows.join("\n")}</code>
      </pre>
    </LabeledCard>
  );
}

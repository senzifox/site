import { LabeledCard } from "@/components/Card/Card";
import type { StatusBlock as Props } from "@/content/types";
import styles from "./StatusBlock.module.css";

export function StatusBlock({ label, text, state = "online" }: Props) {
  const body = text?.trim();

  if (!body) return null;

  return (
    <LabeledCard label={label}>
      <span className={styles.row}>
        <span
          className={`${styles.dot} ${styles[state]}${state === "offline" ? "" : " pulse"}`}
          aria-hidden="true"
        />
        <span className={styles.text}>{body}</span>
      </span>
    </LabeledCard>
  );
}

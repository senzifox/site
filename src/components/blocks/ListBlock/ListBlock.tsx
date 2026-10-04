import { useId } from "react";
import { Card } from "@/components/Card/Card";
import type { ListBlock as Props } from "@/content/types";
import styles from "./ListBlock.module.css";

export function ListBlock({ label, items }: Props) {
  const labelId = useId();
  const heading = label?.trim();
  const entries = items.map((item) => item.trim()).filter(Boolean);

  if (entries.length === 0) return null;

  return (
    <Card className={styles.card} aria-labelledby={heading ? labelId : undefined}>
      {heading && (
        <span id={labelId} className={styles.label}>
          {heading}
        </span>
      )}
      <ul className={styles.items}>
        {entries.map((item) => (
          <li key={item} className={styles.item}>
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

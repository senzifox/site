import { LabeledCard } from "@/components/Card/Card";
import type { ListBlock as Props } from "@/content/types";
import styles from "./ListBlock.module.css";

export function ListBlock({ label, items }: Props) {
  const entries = items.map((item) => item.trim()).filter(Boolean);

  if (entries.length === 0) return null;

  return (
    <LabeledCard label={label}>
      <ul className={styles.items}>
        {entries.map((item) => (
          <li key={item} className={styles.item}>
            {item}
          </li>
        ))}
      </ul>
    </LabeledCard>
  );
}

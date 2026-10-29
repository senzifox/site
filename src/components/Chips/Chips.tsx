import styles from "./Chips.module.css";

export function Chips({ items }: { items: string[] }) {
  return (
    <ul className={styles.items}>
      {items.map((item) => (
        <li key={item} className={styles.item}>
          {item}
        </li>
      ))}
    </ul>
  );
}

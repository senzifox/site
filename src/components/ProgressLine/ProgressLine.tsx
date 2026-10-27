import type { ReactNode } from "react";
import styles from "./ProgressLine.module.css";

export function ProgressLine({ value, children }: { value: number; children?: ReactNode }) {
  const percent = Math.min(1, Math.max(0, value)) * 100;

  return (
    <span className={styles.progress}>
      <span className={styles.track}>
        <span className={styles.fill} style={{ width: `${percent}%` }} />
      </span>
      {children}
    </span>
  );
}

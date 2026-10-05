import { type ComponentProps, type ReactNode, useId } from "react";
import styles from "./Card.module.css";

export const cardClass = styles.card;

export const CARD_RADIUS = 14;

export function Card({ className, ...props }: ComponentProps<"section">) {
  return <section className={className ? `${styles.card} ${className}` : styles.card} {...props} />;
}

type LabeledProps = { label?: string; className?: string; children: ReactNode };

export function LabeledCard({ label, className, children }: LabeledProps) {
  const id = useId();
  const heading = label?.trim();

  return (
    <Card
      className={className ? `${styles.padded} ${className}` : styles.padded}
      aria-labelledby={heading ? id : undefined}
    >
      {heading && (
        <h2 id={id} className={styles.label}>
          {heading}
        </h2>
      )}
      {children}
    </Card>
  );
}

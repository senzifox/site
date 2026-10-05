import type { ComponentProps } from "react";
import styles from "./Card.module.css";

export const cardClass = styles.card;

export const CARD_RADIUS = 14;

export function Card({ className, ...props }: ComponentProps<"section">) {
  return <section className={className ? `${styles.card} ${className}` : styles.card} {...props} />;
}

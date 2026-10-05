"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { Badge } from "@/components/Badge/Badge";
import { CARD_RADIUS, cardClass } from "@/components/Card/Card";
import { Icon } from "@/components/Icon/Icon";
import type { IconName } from "@/components/Icon/icons";
import styles from "./LiveCard.module.css";

export type LiveStatus = "loading" | "idle" | "playing";

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

type CardProps = { label: string; status: LiveStatus; playing: ReactNode; idle: ReactNode };

export function LiveCard({ label, status, playing, idle }: CardProps) {
  return (
    <motion.section
      layout
      layoutDependency={status}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`${cardClass} ${styles.card}`}
      style={{ borderRadius: CARD_RADIUS }}
      aria-label={label}
      aria-busy={status === "loading"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={status}
          {...fade}
          layout="position"
          layoutDependency={status}
          style={{ visibility: status === "loading" ? "hidden" : "visible" }}
        >
          {status === "playing" ? playing : idle}
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}

export function LiveRow({ href, children }: { href?: string; children: ReactNode }) {
  return href ? (
    <a className={styles.row} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <div className={styles.row}>{children}</div>
  );
}

export function LiveLabel({ label, icon }: { label: string; icon: IconName }) {
  return (
    <span className={styles.live}>
      <span className={`${styles.dot} pulse`} />
      {label}
      <Icon name={icon} size={14} className={styles.liveLogo} />
    </span>
  );
}

export function LiveInfo({ label, icon, children }: { label: string; icon: IconName; children: ReactNode }) {
  return (
    <div className={styles.body}>
      <LiveLabel label={label} icon={icon} />
      {children}
    </div>
  );
}

type IdleProps = { icon: IconName; text: string; hint?: string; href?: string };

export function LiveIdle({ icon, text, hint, href }: IdleProps) {
  return (
    <LiveRow href={href}>
      <Badge icon={icon} />
      <div className={styles.body}>
        <span className={styles.text}>{text}</span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>
    </LiveRow>
  );
}

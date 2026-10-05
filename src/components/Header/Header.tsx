"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import styles from "./Header.module.css";
import { RotatingText } from "./RotatingText";
import { useHeaderMotion } from "./useHeaderMotion";

type Props = {
  avatar: ReactNode;
  avatarSize: number;
  name: string;
  lineAbove?: string[];
  lineBelow?: string;
  socials: ReactNode;
};

export function Header({ avatar, avatarSize, name, lineAbove, lineBelow, socials }: Props) {
  const m = useHeaderMotion(avatarSize);
  const lineAboveItems = (lineAbove ?? []).filter(Boolean);

  return (
    <motion.header
      className={styles.header}
      style={{
        height: m.height,
        background: m.background,
        backdropFilter: m.backdropFilter,
        WebkitBackdropFilter: m.backdropFilter,
        borderBottomColor: m.borderColor,
      }}
    >
      <motion.div className={styles.glow} style={{ opacity: m.glowOpacity }} />
      <motion.div className={styles.track} style={{ transform: m.avatar.track }}>
        <motion.div className={`${styles.item} ${styles.avatar}`} style={{ transform: m.avatar.item }}>
          {avatar}
        </motion.div>
      </motion.div>
      {lineAboveItems.length > 0 && (
        <motion.div className={styles.track} style={{ transform: m.lineAbove.track }}>
          <motion.span
            className={`${styles.item} ${styles.lineAbove}`}
            style={{ transform: m.lineAbove.item }}
          >
            <RotatingText items={lineAboveItems} />
          </motion.span>
        </motion.div>
      )}
      <motion.div className={styles.track} style={{ transform: m.name.track }}>
        <motion.h1 className={`${styles.item} ${styles.name}`} style={{ transform: m.name.item }}>
          {name}
        </motion.h1>
      </motion.div>
      {lineBelow && (
        <motion.div
          className={styles.track}
          style={{ transform: m.lineBelow.track, opacity: m.lineBelowOpacity }}
        >
          <motion.span
            className={`${styles.item} ${styles.lineBelow}`}
            style={{ transform: m.lineBelow.item }}
          >
            {lineBelow}
          </motion.span>
        </motion.div>
      )}
      <motion.nav
        className={styles.socials}
        aria-label="socials"
        style={{ opacity: m.socialsOpacity, y: m.socialsY, pointerEvents: m.socialsPointerEvents }}
      >
        {socials}
      </motion.nav>
    </motion.header>
  );
}

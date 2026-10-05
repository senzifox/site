"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { lerp, lightProgress } from "@/lib/scroll";
import styles from "./Background.module.css";

const GLOW = 0.5;
const DOT_STEP = 28;

export function Background() {
  const { scrollY } = useScroll();
  const le = useTransform(scrollY, lightProgress);

  const light = useTransform(le, (v) => {
    const rx = lerp(85, 55, v);
    const ry = lerp(62, 20, v);
    const alpha = lerp(0.34, 0.14, v) * GLOW;
    return `radial-gradient(ellipse ${rx}% ${ry}% at 50% 0, rgb(var(--glow) / ${alpha}), rgb(var(--glow2) / ${alpha * 0.35}) 50%, transparent 100%)`;
  });

  const mask = useTransform(le, (v) => {
    const rx = lerp(85, 55, v) * 1.1;
    const ry = lerp(62, 20, v) * 1.7;
    return `radial-gradient(ellipse ${rx}% ${ry}% at 50% 0, #000, rgb(0 0 0 / 0.45) 100%)`;
  });

  const patternY = useTransform(scrollY, (y) => -((0.25 * y) % DOT_STEP));

  return (
    <div aria-hidden="true">
      <motion.div className={styles.layer} style={{ background: light }} />
      <motion.div
        className={`${styles.layer} ${styles.patternFrame}`}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        <motion.div className={styles.pattern} style={{ y: patternY }} />
      </motion.div>
    </div>
  );
}

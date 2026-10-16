"use client";

import { motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { pointer, subscribePointer } from "@/lib/pointer";
import { lerp, lightProgress } from "@/lib/scroll";
import { registerAction, tuning } from "@/lib/tuning";
import styles from "./Background.module.css";

const DOT_STEP = 28;

const patternShift = (scrollY: number) => -((tuning.background.parallax * scrollY) % DOT_STEP);

export function Background() {
  const { scrollY } = useScroll();
  const le = useTransform(scrollY, lightProgress);
  const spot = useRef<HTMLDivElement>(null);
  const tuned = useMotionValue(0);

  const light = useTransform([le, tuned], ([v]: number[]) => {
    const rx = lerp(85, 55, v);
    const ry = lerp(62, 20, v);
    const alpha = lerp(0.34, 0.14, v) * tuning.background.glow;
    return `radial-gradient(ellipse ${rx}% ${ry}% at 50% 0, rgb(var(--glow) / ${alpha}), rgb(var(--glow2) / ${alpha * 0.35}) 50%, transparent 100%)`;
  });

  const mask = useTransform(le, (v) => {
    const rx = lerp(85, 55, v) * 1.1;
    const ry = lerp(62, 20, v) * 1.7;
    return `radial-gradient(ellipse ${rx}% ${ry}% at 50% 0, #000, rgb(0 0 0 / 0.45) 100%)`;
  });

  const patternY = useTransform([scrollY, tuned], ([y]: number[]) => patternShift(y));

  useEffect(() => registerAction("background.repaint", () => tuned.set(tuned.get() + 1)), [tuned]);

  useEffect(
    () =>
      subscribePointer(() => {
        const element = spot.current;
        if (!element) return;
        element.classList.toggle(styles.on, pointer.active);
        if (!pointer.active) return;
        const { size } = tuning.flashlight;
        const left = pointer.x - size / 2;
        const top = pointer.y - size / 2;
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
        element.style.transform = `translate(${left}px, ${top}px)`;
        element.style.setProperty("--spot-shift", `${-left}px ${patternShift(window.scrollY) - top}px`);
      }),
    [],
  );

  return (
    <div aria-hidden="true">
      <motion.div className={styles.layer} style={{ background: light }} />
      <motion.div
        className={`${styles.layer} ${styles.patternFrame}`}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        <motion.div className={styles.pattern} style={{ y: patternY }} />
      </motion.div>
      <div
        ref={spot}
        className={styles.spot}
        style={{ width: tuning.flashlight.size, height: tuning.flashlight.size }}
      />
    </div>
  );
}

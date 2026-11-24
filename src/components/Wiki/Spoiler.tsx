"use client";

import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { timeScale } from "@/lib/clock";
import { createDust, moteAlpha, stepDust } from "./dust";
import styles from "./Spoiler.module.css";

const MAX_STEP = 0.05;

type Reveal = { revealed: boolean; reveal: () => void };

const RowReveal = createContext<Reveal | null>(null);

export function SpoilerRow({ className: _className, children, ...props }: ComponentProps<"tr">) {
  const [revealed, setRevealed] = useState(false);
  const reveal = useCallback(() => setRevealed(true), []);
  const value = useMemo(() => ({ revealed, reveal }), [revealed, reveal]);

  return (
    <RowReveal value={value}>
      <tr
        {...props}
        className={revealed ? styles.row : `${styles.row} ${styles.blurred}`}
        onClick={revealed ? undefined : reveal}
      >
        {children}
      </tr>
    </RowReveal>
  );
}

function SpoilerDust() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let dust = createDust(0, 0);
    let color = "";
    let visible = false;
    let frame = 0;
    let last = 0;

    const draw = () => {
      const ratio = devicePixelRatio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, dust.width, dust.height);
      context.fillStyle = color;
      for (const mote of dust.motes) {
        context.globalAlpha = moteAlpha(mote);
        context.fillRect(mote.x - mote.size / 2, mote.y - mote.size / 2, mote.size, mote.size);
      }
    };

    const resize = () => {
      const { width, height } = element.getBoundingClientRect();
      element.width = Math.round(width * devicePixelRatio);
      element.height = Math.round(height * devicePixelRatio);
      color = getComputedStyle(element).color;
      dust = createDust(width, height);
      draw();
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(MAX_STEP, (now - last) / 1000) * timeScale() : 0;
      last = now;
      stepDust(dust, dt);
      draw();
      frame = requestAnimationFrame(tick);
    };

    const sync = () => {
      if (visible && !reduced.matches) {
        if (!frame) frame = requestAnimationFrame(tick);
        return;
      }
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    };

    const resizer = new ResizeObserver(resize);
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    resizer.observe(element);
    watcher.observe(element);
    reduced.addEventListener("change", sync);

    return () => {
      visible = false;
      sync();
      resizer.disconnect();
      watcher.disconnect();
      reduced.removeEventListener("change", sync);
    };
  }, []);

  return <canvas ref={canvas} className={styles.dust} />;
}

type Props = { label: string; children: ReactNode };

export function Spoiler({ label, children }: Props) {
  const row = useContext(RowReveal);
  const [ownRevealed, setOwnRevealed] = useState(false);
  const revealed = row?.revealed ?? ownRevealed;
  const text = useRef<HTMLSpanElement>(null);
  const focusOnReveal = useRef(false);

  useEffect(() => {
    if (revealed && focusOnReveal.current) text.current?.focus();
  }, [revealed]);

  if (revealed) {
    return (
      <span ref={text} className={styles.revealed} tabIndex={-1}>
        {children}
      </span>
    );
  }

  const reveal = () => {
    focusOnReveal.current = true;
    if (row) row.reveal();
    else setOwnRevealed(true);
  };

  return (
    <button type="button" className={styles.spoiler} aria-label={label} onClick={reveal}>
      <span className={styles.hidden} aria-hidden="true">
        {children}
      </span>
      <SpoilerDust />
    </button>
  );
}

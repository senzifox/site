"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { timeScale } from "@/lib/clock";
import { registerAction, tuning } from "@/lib/tuning";
import styles from "./Avatar.module.css";
import { Sparks } from "./Sparks";
import { avatars } from "./silhouette";

const OUTLINE_WIDTH = 2;
const ARM_DELAY = 2500;
const SEEN_KEY = "avatar:flipped";

type Segment = { to: number; ms: number; ease: (t: number) => number };

const easeOut = (t: number) => 1 - (1 - t) ** tuning.flip.sharpness;

const easeInOut = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;

const peekFrom = (base: number): Segment[] => {
  const { back, backMs, forth, forthMs, settleMs } = tuning.peek;
  return [
    { to: base - back, ms: backMs, ease: easeInOut },
    { to: base + forth, ms: forthMs, ease: easeInOut },
    { to: base, ms: settleMs, ease: easeInOut },
  ];
};

const wrap = (index: number) => ((index % avatars.length) + avatars.length) % avatars.length;

const sideAt = (angle: number) => (((Math.round(angle / 180) % 2) + 2) % 2) as 0 | 1;

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const seen = () => {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
};

const rememberSeen = () => {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    return;
  }
};

const forgetSeen = () => {
  try {
    localStorage.removeItem(SEEN_KEY);
  } catch {
    return;
  }
};

function Face({ index, side, size }: { index: number; side: 0 | 1; size: number }) {
  const avatar = avatars[index];
  const shape = `avatar-shape-${side}`;
  const clip = `avatar-clip-${side}`;
  const strokeWidth = (OUTLINE_WIDTH * 2 * avatar.size) / size;

  return (
    <svg
      className={side ? `${styles.face} ${styles.back}` : styles.face}
      data-side={side}
      viewBox={`0 0 ${avatar.size} ${avatar.size}`}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <defs>
        <path id={shape} d={avatar.d} />
        <clipPath id={clip}>
          <use href={`#${shape}`} clipRule="evenodd" />
        </clipPath>
      </defs>
      <use href={`#${shape}`} className={styles.outline} strokeWidth={strokeWidth} />
      <image href={avatar.photo} width={avatar.size} height={avatar.size} clipPath={`url(#${clip})`} />
    </svg>
  );
}

export function AvatarStage({ alt, size }: { alt: string; size: number }) {
  const flippable = avatars.length > 1;
  const flipper = useRef<HTMLSpanElement>(null);
  const angle = useRef(0);
  const target = useRef(0);
  const animation = useRef(0);
  const flipped = useRef(false);
  const sidesRef = useRef<[number, number]>([0, wrap(1)]);
  const [sides, setSidesState] = useState(sidesRef.current);
  const [face, setFace] = useState(0);
  const [burst, setBurst] = useState(0);
  const [armed, setArmed] = useState(false);
  const [hinting, setHinting] = useState(0);

  const setSides = (next: [number, number]) => {
    sidesRef.current = next;
    setSidesState(next);
  };

  const render = (to: number) => {
    angle.current = to;
    const element = flipper.current;
    if (!element) return;
    element.style.transform = `rotateY(${to}deg)`;
    const side = sideAt(to);
    for (const child of element.children) {
      if (child instanceof SVGElement)
        child.style.visibility = Number(child.dataset.side) === side ? "visible" : "hidden";
    }
    setFace(sidesRef.current[side]);
  };

  const stop = () => {
    cancelAnimationFrame(animation.current);
    animation.current = 0;
  };

  const play = (segments: Segment[]) => {
    stop();
    target.current = segments[segments.length - 1].to;
    if (reducedMotion()) {
      render(segments[segments.length - 1].to);
      return;
    }
    let index = 0;
    let from = angle.current;
    let elapsed = 0;
    let last = performance.now();
    const frame = (now: number) => {
      elapsed += (now - last) * timeScale();
      last = now;
      const segment = segments[index];
      const t = segment.ms > 0 ? Math.min(1, elapsed / segment.ms) : 1;
      render(from + (segment.to - from) * segment.ease(t));
      if (t < 1) {
        animation.current = requestAnimationFrame(frame);
        return;
      }
      index += 1;
      if (index >= segments.length) {
        animation.current = 0;
        return;
      }
      from = segment.to;
      elapsed = 0;
      animation.current = requestAnimationFrame(frame);
    };
    animation.current = requestAnimationFrame(frame);
  };

  const prepare = (from: number, direction: 1 | -1) => {
    const current = sidesRef.current;
    const hidden = sideAt(from + 180);
    const next = wrap(current[sideAt(from)] + direction);
    if (hidden === sideAt(angle.current)) return;
    if (current[hidden] !== next) setSides(hidden ? [current[0], next] : [next, current[1]]);
  };

  const markFlipped = () => {
    flipped.current = true;
    rememberSeen();
  };

  const flip = (direction: 1 | -1) => {
    setArmed(true);
    markFlipped();
    const base = target.current;
    prepare(base, direction);
    play([{ to: base - 180 * direction, ms: tuning.flip.ms, ease: easeOut }]);
  };

  useEffect(() => {
    if (!flippable) return;
    const timer = setTimeout(() => setArmed(true), ARM_DELAY);
    return () => clearTimeout(timer);
  }, [flippable]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: play reads refs, hinting restarts the hint
  useEffect(() => {
    if (!flippable || seen() || reducedMotion()) return;
    let count = 0;
    const peek = () => {
      if (flipped.current || count >= tuning.peek.limit) return;
      const resting = !animation.current && angle.current % 180 === 0;
      if (resting && !document.hidden) {
        count += 1;
        play(peekFrom(angle.current));
      }
      timer = setTimeout(peek, tuning.peek.every);
    };
    let timer = setTimeout(peek, hinting ? 0 : tuning.peek.delay);
    return () => clearTimeout(timer);
  }, [flippable, hinting]);

  const onClick = () => {
    if (flippable) flip(1);
    setBurst((count) => count + 1);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: handlers only touch refs and stable setters
  useEffect(() => {
    if (!flippable) return;
    const releases = [
      registerAction("avatar.flip", onClick),
      registerAction("avatar.peek", () => play(peekFrom(target.current))),
      registerAction("avatar.unsee", () => {
        forgetSeen();
        flipped.current = false;
        setHinting((count) => count + 1);
      }),
    ];
    return () => {
      stop();
      for (const release of releases) release();
    };
  }, [flippable]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!flippable || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    flip(event.key === "ArrowRight" ? 1 : -1);
  };

  return (
    <button
      type="button"
      className={flippable ? `${styles.root} ${styles.flippable}` : styles.root}
      aria-label={flippable ? `${alt}: next avatar` : alt}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onPointerEnter={() => setArmed(true)}
      onFocus={() => setArmed(true)}
    >
      <span ref={flipper} className={styles.flipper}>
        <Face index={sides[0]} side={0} size={size} />
        {flippable && armed && <Face index={sides[1]} side={1} size={size} />}
      </span>
      <Sparks face={face} burst={burst} />
    </button>
  );
}

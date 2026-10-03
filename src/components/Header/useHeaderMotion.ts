"use client";

import { type MotionValue, useScroll, useTransform } from "motion/react";
import {
  backdropProgress,
  EXPANDED_HEIGHT,
  fadeOut,
  HEADER_RANGE,
  headerProgress,
  lerp,
  smoothstep,
} from "@/lib/scroll";

const COLLAPSED_X = 152;

type Slide = { x: number; from: number; to: number; scale?: number };

const useSlide = (e: MotionValue<number>, { x, from, to, scale = 1 }: Slide) => ({
  track: useTransform(e, (v) => `translateX(calc(${(1 - v) * 50}% + ${v * x}px))`),
  item: useTransform(
    e,
    (v) => `translate(${-(1 - v) * 50}%, ${lerp(from, to, v)}px) scale(${lerp(1, scale, v)})`,
  ),
});

export function useHeaderMotion(avatarSize: number) {
  const { scrollY } = useScroll();
  const p = useTransform(scrollY, headerProgress);
  const e = useTransform(p, smoothstep);
  const k = useTransform(p, backdropProgress);

  return {
    height: useTransform(p, (v) => EXPANDED_HEIGHT - HEADER_RANGE * v),
    background: useTransform(k, (v) => `rgb(var(--head) / ${0.7 * v})`),
    backdropFilter: useTransform(k, (v) => (v > 0 ? `blur(${18 * v}px)` : "none")),
    borderColor: useTransform(k, (v) => `rgb(255 255 255 / ${0.08 * v})`),
    glowOpacity: useTransform(p, (v) => fadeOut(v, 1.6)),
    avatar: useSlide(e, { x: 16, from: 40, to: 8, scale: 120 / avatarSize }),
    lineAbove: useSlide(e, { x: COLLAPSED_X, from: 280, to: 40 }),
    name: useSlide(e, { x: COLLAPSED_X, from: 302, to: 62, scale: 28 / 34 }),
    lineBelow: useSlide(e, { x: COLLAPSED_X, from: 346, to: 104 }),
    lineBelowOpacity: useTransform(p, (v) => fadeOut(v, 2.2)),
    socialsOpacity: useTransform(p, (v) => fadeOut(v, 3)),
    socialsY: useTransform(p, (v) => -60 * v),
    socialsPointerEvents: useTransform(p, (v) => (v < 0.25 ? "auto" : "none")),
  };
}

"use client";

import { type MotionValue, useScroll, useTransform } from "motion/react";
import {
  EXPANDED_HEIGHT,
  fadeOut,
  HEADER_RANGE,
  headerProgress,
  lerp,
  smoothstep,
  surfaceProgress,
} from "@/lib/scroll";

const COLLAPSED_X = 164;
const SURFACE_TOP = 12;

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
  const s = useTransform(p, surfaceProgress);

  return {
    height: useTransform(p, (v) => EXPANDED_HEIGHT - HEADER_RANGE * v),
    surface: {
      top: useTransform(s, (v) => SURFACE_TOP * v),
      inset: useTransform(s, (v) => `calc(var(--gutter) * ${v})`),
      radius: useTransform(s, (v) => `calc(var(--radius-card) * ${v})`),
      opacity: s,
    },
    glowOpacity: useTransform(p, (v) => fadeOut(v, 1.6)),
    avatar: useSlide(e, { x: 28, from: 40, to: 24, scale: 120 / avatarSize }),
    lineAbove: useSlide(e, { x: COLLAPSED_X, from: 280, to: 56 }),
    name: useSlide(e, { x: COLLAPSED_X, from: 302, to: 78, scale: 28 / 34 }),
    lineBelow: useSlide(e, { x: COLLAPSED_X, from: 346, to: 120 }),
    lineBelowOpacity: useTransform(p, (v) => fadeOut(v, 2.2)),
    socialsOpacity: useTransform(p, (v) => fadeOut(v, 3)),
    socialsY: useTransform(p, (v) => -60 * v),
    socialsPointerEvents: useTransform(p, (v) => (v < 0.25 ? "auto" : "none")),
  };
}

"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { pointer, subscribePointer } from "@/lib/pointer";
import { clamp01, smoothstep } from "@/lib/scroll";
import styles from "./Avatar.module.css";
import { silhouette } from "./silhouette";
import { createSparkField, keepClear, sparkPose } from "./sparks";

const field = createSparkField(silhouette.d);
const { size } = silhouette;

const WARMUP = 1.4;
const MAX_STEP = 0.05;
const CURSOR_RADIUS = 80;
const PUSH = 5200;
const SPRING = 38;
const DAMPING = 8.5;
const BURST = 1500;
const HEAT_DECAY = 3;

const initial = field.sparks.map((spark) => ({ spark, pose: sparkPose(field, spark, 0, 0) }));

export function Sparks({ children }: { children: ReactNode }) {
  const layer = useRef<SVGSVGElement>(null);
  const burst = useRef(() => {});

  useEffect(() => {
    const svg = layer.current;
    if (!svg) return;
    const circles = [...svg.querySelectorAll("circle")];
    const state = field.sparks.map(() => ({ dx: 0, dy: 0, vx: 0, vy: 0, heat: 0 }));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let time = 0;
    let last = 0;
    let frame = 0;

    const tick = (now: number) => {
      frame = 0;
      const dt = last ? Math.min(MAX_STEP, (now - last) / 1000) : 0;
      last = now;
      time += dt;
      const motion = smoothstep(clamp01(time / WARMUP));
      const rect = svg.getBoundingClientRect();
      const scale = rect.width > 0 ? size / rect.width : 0;
      const grow = rect.width > 0 ? svg.clientWidth / rect.width : 1;
      const cursor = pointer.active &&
        scale > 0 && { x: (pointer.x - rect.left) * scale, y: (pointer.y - rect.top) * scale };
      const radius = CURSOR_RADIUS * scale;

      for (const [i, spark] of field.sparks.entries()) {
        const pose = sparkPose(field, spark, time, motion);
        const s = state[i];
        let ax = -SPRING * s.dx - DAMPING * s.vx;
        let ay = -SPRING * s.dy - DAMPING * s.vy;
        let warmth = 0;
        if (cursor) {
          const ox = pose.x + s.dx - cursor.x;
          const oy = pose.y + s.dy - cursor.y;
          const dist = Math.sqrt(ox * ox + oy * oy) || 1;
          if (dist < radius) {
            const k = 1 - dist / radius;
            ax += (ox / dist) * PUSH * k * k;
            ay += (oy / dist) * PUSH * k * k;
            warmth = k;
          }
        }
        s.vx += ax * dt;
        s.vy += ay * dt;
        s.dx += s.vx * dt;
        s.dy += s.vy * dt;
        s.heat = Math.max(warmth, s.heat - HEAT_DECAY * dt * s.heat);

        const at = keepClear(field, { x: pose.x + s.dx, y: pose.y + s.dy });
        const circle = circles[i];
        circle.setAttribute("cx", at.x.toFixed(1));
        circle.setAttribute("cy", at.y.toFixed(1));
        circle.setAttribute("r", (spark.r * grow * (1 + 0.7 * s.heat)).toFixed(1));
        circle.setAttribute("opacity", Math.min(1, pose.alpha + 0.5 * s.heat).toFixed(2));
      }

      frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!frame && !reduced.matches) frame = requestAnimationFrame(tick);
    };

    const sleep = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    };

    const onMotionChange = () => (reduced.matches ? sleep() : wake());

    burst.current = () => {
      if (reduced.matches) return;
      for (const [i, spark] of field.sparks.entries()) {
        const pose = sparkPose(field, spark, time, smoothstep(clamp01(time / WARMUP)));
        const s = state[i];
        const ox = pose.x + s.dx - field.center.x;
        const oy = pose.y + s.dy - field.center.y;
        const dist = Math.sqrt(ox * ox + oy * oy) || 1;
        const impulse = BURST * (0.6 + Math.random() * 0.8);
        s.vx += (ox / dist) * impulse;
        s.vy += (oy / dist) * impulse;
        s.heat = 1;
      }
      wake();
    };

    wake();
    const release = subscribePointer(wake);
    reduced.addEventListener("change", onMotionChange);

    return () => {
      sleep();
      burst.current = () => {};
      release();
      reduced.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <span className={styles.root} onPointerDown={() => burst.current()}>
      {children}
      <svg ref={layer} className={styles.sparks} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {initial.map(({ spark, pose }) => (
          <circle
            key={spark.id}
            className={styles.spark}
            cx={pose.x.toFixed(1)}
            cy={pose.y.toFixed(1)}
            r={spark.r.toFixed(1)}
            opacity={pose.alpha.toFixed(2)}
          />
        ))}
      </svg>
    </span>
  );
}

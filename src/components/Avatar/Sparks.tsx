"use client";

import { useEffect, useRef } from "react";
import { pointer, subscribePointer } from "@/lib/pointer";
import { clamp01, smoothstep } from "@/lib/scroll";
import { registerAction, tuning } from "@/lib/tuning";
import styles from "./Avatar.module.css";
import { avatars } from "./silhouette";
import { createSparkField, keepClear, type SparkField, sparkPose } from "./sparks";

const fields = avatars.map(({ d, size }) => createSparkField(d, size));
const [{ size }] = avatars;

const WARMUP = 1.4;
const MAX_STEP = 0.05;
const HEAT_DECAY = 3;
const SETTLE = 0.8;
const RETARGET_BURST = 0.5;

const initial = fields[0].sparks.map((spark) => ({ spark, pose: sparkPose(fields[0], spark, 0, 0) }));

type Props = { face: number; burst: number };

export function Sparks({ face, burst }: Props) {
  const layer = useRef<SVGSVGElement>(null);
  const actions = useRef({ burst: () => {}, retarget: (_index: number) => {} });

  useEffect(() => {
    const svg = layer.current;
    if (!svg) return;
    const circles = [...svg.querySelectorAll("circle")];
    const state = initial.map(({ pose }) => ({ x: pose.x, y: pose.y, dx: 0, dy: 0, vx: 0, vy: 0, heat: 0 }));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let field: SparkField = fields[0];
    let settle = 1;
    let time = 0;
    let last = 0;
    let frame = 0;

    const motionAt = () => smoothstep(clamp01(time / WARMUP));

    const step = (dt: number) => {
      const motion = motionAt();
      const rect = svg.getBoundingClientRect();
      const scale = rect.width > 0 ? size / rect.width : 0;
      const grow = rect.width > 0 ? svg.clientWidth / rect.width : 1;
      const cursor = pointer.active &&
        scale > 0 && { x: (pointer.x - rect.left) * scale, y: (pointer.y - rect.top) * scale };
      const { cursorRadius, push, spring, damping } = tuning.sparks;
      const radius = cursorRadius * scale;
      settle = Math.min(1, settle + dt / SETTLE);
      const clearing = smoothstep(settle);

      for (const [i, spark] of field.sparks.entries()) {
        const pose = sparkPose(field, spark, time, motion);
        const s = state[i];
        let ax = -spring * s.dx - damping * s.vx;
        let ay = -spring * s.dy - damping * s.vy;
        let warmth = 0;
        if (cursor) {
          const ox = pose.x + s.dx - cursor.x;
          const oy = pose.y + s.dy - cursor.y;
          const dist = Math.sqrt(ox * ox + oy * oy) || 1;
          if (dist < radius) {
            const k = 1 - dist / radius;
            ax += (ox / dist) * push * k * k;
            ay += (oy / dist) * push * k * k;
            warmth = k;
          }
        }
        s.vx += ax * dt;
        s.vy += ay * dt;
        s.dx += s.vx * dt;
        s.dy += s.vy * dt;
        s.heat = Math.max(warmth, s.heat - HEAT_DECAY * dt * s.heat);

        const raw = { x: pose.x + s.dx, y: pose.y + s.dy };
        const clear = keepClear(field, raw);
        s.x = raw.x + (clear.x - raw.x) * clearing;
        s.y = raw.y + (clear.y - raw.y) * clearing;
        const circle = circles[i];
        circle.setAttribute("cx", s.x.toFixed(1));
        circle.setAttribute("cy", s.y.toFixed(1));
        circle.setAttribute("r", (spark.r * grow * (1 + 0.7 * s.heat)).toFixed(1));
        circle.setAttribute("opacity", Math.min(1, pose.alpha + 0.5 * s.heat).toFixed(2));
      }
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(MAX_STEP, (now - last) / 1000) : 0;
      last = now;
      time += dt;
      step(dt);
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

    const scatter = (strength: number) => {
      const motion = motionAt();
      for (const [i, spark] of field.sparks.entries()) {
        const pose = sparkPose(field, spark, time, motion);
        const s = state[i];
        const ox = pose.x + s.dx - field.center.x;
        const oy = pose.y + s.dy - field.center.y;
        const dist = Math.sqrt(ox * ox + oy * oy) || 1;
        const impulse = tuning.sparks.burst * strength * (0.6 + Math.random() * 0.8);
        s.vx += (ox / dist) * impulse;
        s.vy += (oy / dist) * impulse;
        s.heat = Math.max(s.heat, strength);
      }
    };

    const onMotionChange = () => (reduced.matches ? sleep() : wake());

    actions.current = {
      burst: () => {
        if (reduced.matches) return;
        scatter(1);
        wake();
      },
      retarget: (index) => {
        const next = fields[index];
        if (!next || next === field) return;
        const motion = motionAt();
        for (const [i, spark] of next.sparks.entries()) {
          const target = sparkPose(next, spark, time, motion);
          const s = state[i];
          s.dx = reduced.matches ? 0 : s.x - target.x;
          s.dy = reduced.matches ? 0 : s.y - target.y;
        }
        field = next;
        if (reduced.matches) {
          step(0);
          return;
        }
        settle = 0;
        scatter(RETARGET_BURST);
        wake();
      },
    };

    wake();
    const release = subscribePointer(wake);
    const unregister = registerAction("sparks.burst", () => actions.current.burst());
    reduced.addEventListener("change", onMotionChange);

    return () => {
      sleep();
      actions.current = { burst: () => {}, retarget: () => {} };
      release();
      unregister();
      reduced.removeEventListener("change", onMotionChange);
    };
  }, []);

  useEffect(() => actions.current.retarget(face), [face]);

  useEffect(() => {
    if (burst > 0) actions.current.burst();
  }, [burst]);

  return (
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
  );
}

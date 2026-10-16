"use client";

import { useEffect, useRef, useState } from "react";
import { timeScale } from "@/lib/clock";
import { pointer, subscribePointer } from "@/lib/pointer";
import { clamp01, smoothstep } from "@/lib/scroll";
import { registerAction, tuning } from "@/lib/tuning";
import styles from "./Avatar.module.css";
import { avatars } from "./silhouette";
import {
  clockAt,
  createSparkField,
  keepClear,
  type Spark,
  type SparkClock,
  type SparkField,
  type SparkLayout,
  sparkPose,
  sparkRates,
  sparkSize,
} from "./sparks";

const [{ size }] = avatars;

const WARMUP = 1.4;
const MAX_STEP = 0.05;
const SETTLE = 0.8;
const RETARGET_BURST = 0.5;

let built = { key: "", fields: [] as SparkField[] };

const buildFields = (layout: SparkLayout) => {
  const key = JSON.stringify(layout);
  if (key !== built.key) built = { key, fields: avatars.map(({ d }) => createSparkField(d, size, layout)) };
  return built.fields;
};

const currentFields = () => buildFields(tuning.sparkLayout);

type SparkState = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  vx: number;
  vy: number;
  heat: number;
  clock: SparkClock;
};

type Carry = { time: number; face: number; state: SparkState[] };

type Paint = { cx: string; cy: string; r: string; opacity: string };

const painted = new Map<number, Paint>();

const paintOnce = (field: SparkField, spark: Spark) => {
  const known = painted.get(spark.id);
  if (known) return known;
  const pose = sparkPose(field, spark, clockAt(field, spark, 0), 0);
  const paint = {
    cx: pose.x.toFixed(1),
    cy: pose.y.toFixed(1),
    r: sparkSize(spark).toFixed(1),
    opacity: pose.alpha.toFixed(2),
  };
  painted.set(spark.id, paint);
  return paint;
};

type Props = { face: number; burst: number };

export function Sparks({ face, burst }: Props) {
  const layer = useRef<SVGSVGElement>(null);
  const actions = useRef({ burst: () => {}, retarget: (_index: number) => {} });
  const carry = useRef<Carry | null>(null);
  const [fields, setFields] = useState(currentFields);

  useEffect(() => registerAction("sparks.layout", () => setFields(currentFields())), []);

  useEffect(() => {
    const svg = layer.current;
    if (!svg) return;
    const circles = [...svg.querySelectorAll("circle")];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const previous = carry.current;
    let face = previous?.face ?? 0;
    let field: SparkField = fields[face] ?? fields[0];
    let settle = previous ? 0 : 1;
    let time = previous?.time ?? 0;
    let last = 0;
    let frame = 0;

    const motionAt = () => smoothstep(clamp01(time / WARMUP));

    const state = field.sparks.map((spark, i): SparkState => {
      const from = previous?.state[i];
      const clock = from ? { ...from.clock } : { drift: 0, wobble: 0, twinkle: 0 };
      const pose = sparkPose(field, spark, clock, motionAt());
      const x = from && !reduced.matches ? from.x : pose.x;
      const y = from && !reduced.matches ? from.y : pose.y;
      return {
        x,
        y,
        dx: x - pose.x,
        dy: y - pose.y,
        vx: from?.vx ?? 0,
        vy: from?.vy ?? 0,
        heat: from?.heat ?? 0,
        clock,
      };
    });

    const step = (dt: number) => {
      const motion = motionAt();
      const rect = svg.getBoundingClientRect();
      const scale = rect.width > 0 ? size / rect.width : 0;
      const grow = rect.width > 0 ? svg.clientWidth / rect.width : 1;
      const cursor = pointer.active &&
        scale > 0 && { x: (pointer.x - rect.left) * scale, y: (pointer.y - rect.top) * scale };
      const { cursorRadius, push, spring, damping } = tuning.sparks;
      const look = tuning.sparkLook;
      const radius = cursorRadius * scale;
      settle = Math.min(1, settle + dt / SETTLE);
      const clearing = smoothstep(settle);

      for (const [i, spark] of field.sparks.entries()) {
        const s = state[i];
        const rates = sparkRates(field, spark);
        s.clock.drift += rates.drift * dt;
        s.clock.wobble += rates.wobble * dt;
        s.clock.twinkle += rates.twinkle * dt;
        const pose = sparkPose(field, spark, s.clock, motion);
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
        s.heat = Math.max(warmth, s.heat - look.heatDecay * dt * s.heat);

        const raw = { x: pose.x + s.dx, y: pose.y + s.dy };
        const clear = keepClear(field, raw);
        s.x = raw.x + (clear.x - raw.x) * clearing;
        s.y = raw.y + (clear.y - raw.y) * clearing;
        const circle = circles[i];
        circle.setAttribute("cx", s.x.toFixed(1));
        circle.setAttribute("cy", s.y.toFixed(1));
        circle.setAttribute("r", (sparkSize(spark) * grow * (1 + look.heatGrow * s.heat)).toFixed(1));
        circle.setAttribute("opacity", Math.min(1, pose.alpha + look.heatGlow * s.heat).toFixed(2));
      }
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(MAX_STEP, (now - last) / 1000) * timeScale() : 0;
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
        const s = state[i];
        const pose = sparkPose(field, spark, s.clock, motion);
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
          const s = state[i];
          const target = sparkPose(next, spark, s.clock, motion);
          s.dx = reduced.matches ? 0 : s.x - target.x;
          s.dy = reduced.matches ? 0 : s.y - target.y;
        }
        field = next;
        face = index;
        if (reduced.matches) {
          step(0);
          return;
        }
        settle = 0;
        scatter(RETARGET_BURST);
        wake();
      },
    };

    step(0);
    wake();
    const release = subscribePointer(wake);
    const unregister = registerAction("sparks.burst", () => actions.current.burst());
    reduced.addEventListener("change", onMotionChange);

    return () => {
      sleep();
      carry.current = { time, face, state };
      actions.current = { burst: () => {}, retarget: () => {} };
      release();
      unregister();
      reduced.removeEventListener("change", onMotionChange);
    };
  }, [fields]);

  useEffect(() => actions.current.retarget(face), [face]);

  useEffect(() => {
    if (burst > 0) actions.current.burst();
  }, [burst]);

  return (
    <svg ref={layer} className={styles.sparks} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {fields[0].sparks.map((spark) => (
        <circle key={spark.id} className={styles.spark} {...paintOnce(fields[0], spark)} />
      ))}
    </svg>
  );
}

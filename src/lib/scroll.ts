export const HEADER_RANGE = 300;
export const EXPANDED_HEIGHT = 436;
export const LIGHT_RANGE = 600;

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

export const smoothstep = (t: number) => t * t * (3 - 2 * t);

export const headerProgress = (scrollY: number) => clamp01(scrollY / HEADER_RANGE);

export const lightProgress = (scrollY: number) => 1 - (1 - clamp01(scrollY / LIGHT_RANGE)) ** 2;

export const backdropProgress = (p: number) => clamp01((p - 0.85) / 0.15);

export const fadeOut = (p: number, speed: number) => Math.max(0, 1 - p * speed);

export const headerCssVars = {
  "--header-expanded": `${EXPANDED_HEIGHT}px`,
  "--header-range": `${HEADER_RANGE}px`,
};

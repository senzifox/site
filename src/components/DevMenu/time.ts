import { timeScale } from "@/lib/clock";

let syncFrame = 0;

export const syncAnimations = () => {
  const rate = timeScale();
  for (const animation of document.getAnimations()) {
    const target = animation.effect instanceof KeyframeEffect ? animation.effect.target : null;
    if (target?.closest("[data-dev-menu]")) continue;
    if (animation.playbackRate !== rate) animation.playbackRate = rate;
  }
  cancelAnimationFrame(syncFrame);
  syncFrame = rate === 1 ? 0 : requestAnimationFrame(syncAnimations);
};

const FPS_SMOOTHING = 0.1;
export const FPS_INTERVAL = 100;

export const fps = { value: 0 };

export const measureFps = () => {
  let frame = 0;
  let last = 0;
  const tick = (now: number) => {
    if (last) fps.value += (1000 / (now - last) - fps.value) * FPS_SMOOTHING;
    last = now;
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
};

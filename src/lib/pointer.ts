export type PointerState = { x: number; y: number; active: boolean };

export const pointer: PointerState = { x: 0, y: 0, active: false };

const listeners = new Set<() => void>();
let frame = 0;

const flush = () => {
  frame = 0;
  for (const listener of listeners) listener();
};

const schedule = () => {
  if (!frame) frame = requestAnimationFrame(flush);
};

const onMove = (event: PointerEvent) => {
  if (event.pointerType === "touch") {
    pointer.active = false;
  } else {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  }
  schedule();
};

const onLeave = () => {
  pointer.active = false;
  schedule();
};

const attach = () => {
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("blur", onLeave);
  document.documentElement.addEventListener("pointerleave", onLeave);
};

const detach = () => {
  window.removeEventListener("pointermove", onMove);
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("blur", onLeave);
  document.documentElement.removeEventListener("pointerleave", onLeave);
  cancelAnimationFrame(frame);
  frame = 0;
};

export const subscribePointer = (listener: () => void) => {
  if (listeners.size === 0) attach();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) detach();
  };
};

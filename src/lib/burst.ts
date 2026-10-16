import { tuning } from "@/lib/tuning";

const TAU = Math.PI * 2;

const within = ([min, max]: number[]) => min + Math.random() * (max - min);

export const burstFrom = (element: Element) => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const rect = element.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const look = tuning.copyBurst;
  const count = Math.round(look.count);

  for (let i = 0; i < count; i++) {
    const size = within(look.size);
    const angle = (i / count) * TAU + Math.random() * 0.5;
    const distance = within(look.distance);
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const spark = document.createElement("span");
    spark.style.cssText = `position:fixed;left:${cx - size / 2}px;top:${cy - size / 2}px;width:${size}px;height:${size}px;border-radius:50%;background:var(--accent);box-shadow:0 0 6px rgb(var(--glow) / 0.9);pointer-events:none;z-index:100`;
    document.body.append(spark);
    const remove = () => spark.remove();
    spark
      .animate(
        [
          { transform: "translate(0, 0) scale(1)", opacity: 1 },
          { transform: `translate(${dx * 0.8}px, ${dy * 0.8}px) scale(1)`, opacity: 1, offset: 0.45 },
          { transform: `translate(${dx}px, ${dy + look.drop}px) scale(0.3)`, opacity: 0 },
        ],
        { duration: within(look.duration), easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
      )
      .finished.then(remove, remove);
  }
};

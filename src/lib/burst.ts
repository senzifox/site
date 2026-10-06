const COUNT = 14;
const TAU = Math.PI * 2;

export const burstFrom = (element: Element) => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const rect = element.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < COUNT; i++) {
    const size = 2 + Math.random() * 3;
    const angle = (i / COUNT) * TAU + Math.random() * 0.5;
    const distance = 22 + Math.random() * 34;
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
          { transform: `translate(${dx}px, ${dy + 14}px) scale(0.3)`, opacity: 0 },
        ],
        { duration: 550 + Math.random() * 350, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
      )
      .finished.then(remove, remove);
  }
};

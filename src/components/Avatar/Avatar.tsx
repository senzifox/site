import styles from "./Avatar.module.css";
import { silhouette } from "./silhouette";

export const AVATAR_SIZE = 220;

const OUTLINE_WIDTH = 2;

export function Avatar({ alt }: { alt: string }) {
  const { size, d, sparks } = silhouette;
  const strokeWidth = (OUTLINE_WIDTH * 2 * size) / AVATAR_SIZE;

  return (
    <svg
      className={styles.avatar}
      viewBox={`0 0 ${size} ${size}`}
      width={AVATAR_SIZE}
      height={AVATAR_SIZE}
      role="img"
      aria-label={alt}
    >
      <defs>
        <path id="avatar-shape" d={d} />
        <clipPath id="avatar-clip">
          <use href="#avatar-shape" clipRule="evenodd" />
        </clipPath>
      </defs>
      <use href="#avatar-shape" className={styles.outline} strokeWidth={strokeWidth} />
      <image href="/avatar.webp" width={size} height={size} clipPath="url(#avatar-clip)" />
      {sparks && <path d={sparks} className={styles.sparks} strokeWidth={strokeWidth / 2} />}
    </svg>
  );
}

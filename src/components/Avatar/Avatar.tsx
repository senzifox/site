import { preload } from "react-dom";
import styles from "./Avatar.module.css";
import { Sparks } from "./Sparks";
import { silhouette } from "./silhouette";

export const AVATAR_SIZE = 220;

const PHOTO = "/avatar.webp";

const OUTLINE_WIDTH = 2;

export function Avatar({ alt }: { alt: string }) {
  preload(PHOTO, { as: "image", fetchPriority: "high" });
  const { size, d } = silhouette;
  const strokeWidth = (OUTLINE_WIDTH * 2 * size) / AVATAR_SIZE;

  return (
    <Sparks>
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
        <image href={PHOTO} width={size} height={size} clipPath="url(#avatar-clip)" />
      </svg>
    </Sparks>
  );
}

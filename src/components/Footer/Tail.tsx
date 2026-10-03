import { useId } from "react";
import styles from "./Footer.module.css";
import { PauseOnReducedMotion } from "./PauseOnReducedMotion";
import { tail } from "./tail";

const DURATION = "3.2s";
const EASE = Array.from({ length: tail.shapes.length - 1 }, () => "0.45 0 0.55 1").join(";");

function Morph({ frames }: { frames: string[] }) {
  return (
    <animate
      attributeName="d"
      values={frames.join(";")}
      keyTimes={tail.keyTimes}
      keySplines={EASE}
      calcMode="spline"
      dur={DURATION}
      repeatCount="indefinite"
    />
  );
}

export function Tail() {
  const id = useId();

  const shapeId = `${id}-shape`;
  const clipId = `${id}-clip`;

  return (
    <PauseOnReducedMotion className={styles.tailWrap}>
      <svg
        className={styles.tail}
        viewBox={`0 0 ${tail.width} ${tail.height}`}
        width={56}
        height={(56 * tail.height) / tail.width}
        aria-hidden="true"
      >
        <defs>
          <path id={shapeId} d={tail.shapes[0]}>
            <Morph frames={tail.shapes} />
          </path>
          <clipPath id={clipId}>
            <use href={`#${shapeId}`} />
          </clipPath>
        </defs>
        <use href={`#${shapeId}`} className={styles.fur} />
        <g clipPath={`url(#${clipId})`}>
          <path className={styles.tip} d={tail.tip} />
          <path className={styles.strand} d={tail.strands[0]}>
            <Morph frames={tail.strands} />
          </path>
        </g>
      </svg>
    </PauseOnReducedMotion>
  );
}

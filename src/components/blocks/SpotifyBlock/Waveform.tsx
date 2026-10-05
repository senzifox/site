import { isBarPlayed, waveformBars } from "@/lib/waveform";
import styles from "./SpotifyBlock.module.css";

export function Waveform({ progress }: { progress: number }) {
  return (
    <div className={styles.wave}>
      <div className={styles.bars}>
        {waveformBars.map((bar) => (
          <div
            key={bar.id}
            className={isBarPlayed(bar.id, progress) ? `${styles.bar} ${styles.played}` : styles.bar}
            style={{ height: `${bar.height}%` }}
          />
        ))}
      </div>
      <div className={styles.headTrack} style={{ transform: `translateX(${progress * 100}%)` }}>
        <div className={styles.head} />
      </div>
    </div>
  );
}

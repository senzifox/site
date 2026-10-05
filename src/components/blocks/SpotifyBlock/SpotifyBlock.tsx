"use client";

import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/Badge/Badge";
import { cardClass } from "@/components/Card/Card";
import { Icon } from "@/components/Icon/Icon";
import type { SpotifyBlock as Props } from "@/content/types";
import { formatTime } from "@/lib/format";
import styles from "./SpotifyBlock.module.css";
import { useSpotify } from "./useSpotify";
import { Waveform } from "./Waveform";

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

function Idle({ text, hint, href }: { text: string; hint?: string; href?: string }) {
  const content = (
    <>
      <Badge icon="spotify" />
      <div className={styles.idleBody}>
        <span className={styles.idleText}>{text}</span>
        {hint && <span className={styles.idleHint}>{hint}</span>}
      </div>
      {href && (
        <span className={styles.idleAction}>
          <Icon name="openInNew" size={20} />
        </span>
      )}
    </>
  );

  return href ? (
    <a className={`${styles.idle} ${styles.idleLink}`} href={href} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : (
    <div className={styles.idle}>{content}</div>
  );
}

export function SpotifyBlock({ label, idleText, idleHint, href }: Props) {
  const state = useSpotify();

  return (
    <motion.section
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`${cardClass} ${styles.card}`}
      style={{ borderRadius: 14 }}
      aria-label={label}
      aria-busy={state.status === "loading"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {state.status === "playing" ? (
          <motion.a
            key="playing"
            {...fade}
            layout="position"
            className={styles.player}
            href={state.track.songUrl || undefined}
            target={state.track.songUrl ? "_blank" : undefined}
            rel={state.track.songUrl ? "noopener noreferrer" : undefined}
          >
            {state.track.albumImageUrl ? (
              <img className={styles.cover} src={state.track.albumImageUrl} alt="" width={120} height={120} />
            ) : (
              <div className={`${styles.cover} ${styles.coverEmpty}`}>
                <Icon name="equalizer" size={40} />
              </div>
            )}
            <div className={styles.info}>
              <div className={styles.meta}>
                <span className={styles.live}>
                  <span className={styles.dot} />
                  {label}
                  <Icon name="spotify" size={14} className={styles.liveLogo} />
                </span>
                <span className={styles.title}>{state.track.title}</span>
                <span className={styles.artist}>{state.track.artists.join(", ")}</span>
              </div>
              <div className={styles.progress}>
                <Waveform
                  key={
                    state.track.songUrl ||
                    `${state.track.title}:${state.track.artists.join(", ")}:${state.track.durationMs}`
                  }
                  progress={state.progressMs / state.track.durationMs}
                />
                <div className={styles.time}>
                  <span>{formatTime(state.progressMs)}</span>
                  <span>{formatTime(state.track.durationMs)}</span>
                </div>
              </div>
            </div>
          </motion.a>
        ) : (
          <motion.div
            key={state.status}
            {...fade}
            layout="position"
            style={{ visibility: state.status === "loading" ? "hidden" : "visible" }}
          >
            <Idle text={idleText} hint={idleHint} href={href} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

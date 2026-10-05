"use client";

import { Icon } from "@/components/Icon/Icon";
import type { SpotifyBlock as Props } from "@/content/types";
import { formatTime } from "@/lib/format";
import { LiveCard, LiveIdle, LiveLabel } from "../LiveCard/LiveCard";
import styles from "./SpotifyBlock.module.css";
import { useSpotify } from "./useSpotify";
import { Waveform } from "./Waveform";

export function SpotifyBlock({ label, idleText, idleHint, href }: Props) {
  const state = useSpotify();
  const track = state.status === "playing" ? state.track : null;
  const artists = track?.artists.join(", ") ?? "";

  return (
    <LiveCard
      label={label}
      status={state.status}
      idle={<LiveIdle icon="spotify" text={idleText} hint={idleHint} href={href} />}
      playing={
        track && (
          <a
            className={styles.player}
            href={track.songUrl || undefined}
            target={track.songUrl ? "_blank" : undefined}
            rel={track.songUrl ? "noopener noreferrer" : undefined}
          >
            {track.albumImageUrl ? (
              <img className={styles.cover} src={track.albumImageUrl} alt="" width={120} height={120} />
            ) : (
              <div className={`${styles.cover} ${styles.coverEmpty}`}>
                <Icon name="equalizer" size={40} />
              </div>
            )}
            <div className={styles.info}>
              <div className={styles.meta}>
                <LiveLabel label={label} icon="spotify" />
                <span className={styles.title}>{track.title}</span>
                <span className={styles.artist}>{artists}</span>
              </div>
              <div className={styles.progress}>
                <Waveform
                  key={track.songUrl || `${track.title}:${artists}:${track.durationMs}`}
                  progress={track.progressMs / track.durationMs}
                />
                <div className={styles.time}>
                  <span>{formatTime(track.progressMs)}</span>
                  <span>{formatTime(track.durationMs)}</span>
                </div>
              </div>
            </div>
          </a>
        )
      }
    />
  );
}

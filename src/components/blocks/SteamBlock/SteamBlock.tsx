"use client";

import { useState } from "react";
import { Badge } from "@/components/Badge/Badge";
import type { SteamBlock as Props } from "@/content/types";
import { fillGame, type Game } from "@/lib/steam/types";
import { LiveCard, LiveIdle, LiveInfo, LiveRow } from "../LiveCard/LiveCard";
import styles from "./SteamBlock.module.css";
import { useSteam } from "./useSteam";

function Cover({ game }: { game: Game }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Badge icon="steam" />;
  return (
    <img
      className={styles.cover}
      src={game.imageUrl}
      alt=""
      width={86}
      height={40}
      onError={() => setFailed(true)}
    />
  );
}

export function SteamBlock({ label, idleText, idleHint, recentHint, href }: Props) {
  const state = useSteam();
  const recent = state.status === "idle" ? state.recent : null;
  const hint = recent && recentHint ? fillGame(recentHint, recent.name) : idleHint;

  return (
    <LiveCard
      label={label}
      status={state.status}
      idle={<LiveIdle icon="steam" text={idleText} hint={hint} href={href} />}
      playing={
        state.status === "playing" && (
          <LiveRow href={state.game.url}>
            <Cover game={state.game} />
            <LiveInfo label={label} icon="steam">
              <span className={styles.name}>{state.game.name}</span>
            </LiveInfo>
          </LiveRow>
        )
      }
    />
  );
}

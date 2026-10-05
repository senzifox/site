"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Badge } from "@/components/Badge/Badge";
import { cardClass } from "@/components/Card/Card";
import { Icon } from "@/components/Icon/Icon";
import type { SteamBlock as Props } from "@/content/types";
import type { Game } from "@/lib/steam/types";
import styles from "./SteamBlock.module.css";
import { useSteam } from "./useSteam";

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

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

function Row({ href, children }: { href?: string; children: React.ReactNode }) {
  return href ? (
    <a className={styles.row} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <div className={styles.row}>{children}</div>
  );
}

export function SteamBlock({ label, idleText, idleHint, recentHint, href }: Props) {
  const state = useSteam();
  const recent = state.status === "idle" ? state.recent : null;
  const hint = recent && recentHint ? recentHint.replace("{game}", recent.name) : idleHint;

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
          <motion.div key="playing" {...fade} layout="position">
            <Row href={state.game.url}>
              <Cover game={state.game} />
              <div className={styles.body}>
                <span className={styles.live}>
                  <span className={styles.dot} />
                  {label}
                  <Icon name="steam" size={14} className={styles.liveLogo} />
                </span>
                <span className={styles.name}>{state.game.name}</span>
              </div>
            </Row>
          </motion.div>
        ) : (
          <motion.div
            key={state.status}
            {...fade}
            layout="position"
            style={{ visibility: state.status === "loading" ? "hidden" : "visible" }}
          >
            <Row href={href}>
              <Badge icon="steam" />
              <div className={styles.body}>
                <span className={styles.text}>{idleText}</span>
                {hint && <span className={styles.hint}>{hint}</span>}
              </div>
            </Row>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

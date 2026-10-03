export type Track = {
  isPlaying: true;
  title: string;
  artist: string;
  albumImageUrl: string;
  songUrl: string;
  progressMs: number;
  durationMs: number;
};

export type NowPlaying = Track | { isPlaying: false };

export const idle: NowPlaying = { isPlaying: false };

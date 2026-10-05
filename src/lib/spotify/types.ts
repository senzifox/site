type Playing = {
  isPlaying: true;
  title: string;
  artists: string[];
  albumImageUrl: string;
  songUrl: string;
  progressMs: number;
  durationMs: number;
};

export type SpotifyNow = Playing | { isPlaying: false };

export const spotifyIdle: SpotifyNow = { isPlaying: false };

export const advance = (data: SpotifyNow, elapsedMs: number): SpotifyNow =>
  data.isPlaying
    ? { ...data, progressMs: Math.min(data.durationMs, data.progressMs + Math.max(0, elapsedMs)) }
    : data;

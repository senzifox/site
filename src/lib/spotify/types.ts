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

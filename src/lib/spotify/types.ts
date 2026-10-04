export type Track = {
  isPlaying: true;
  title: string;
  artist: string;
  albumImageUrl: string;
  songUrl: string;
  progressMs: number;
  durationMs: number;
};

export type NowSpotify = Track | { isPlaying: false };

export const spotifyIdle: NowSpotify = { isPlaying: false };

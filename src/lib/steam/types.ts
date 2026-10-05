export type Game = { name: string; appId: string; imageUrl: string; url: string };

export type NowSteam = { isPlaying: true; game: Game } | { isPlaying: false; recent: Game | null };

export const steamIdle: NowSteam = { isPlaying: false, recent: null };

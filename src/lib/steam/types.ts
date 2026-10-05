export type Game = { name: string; appId: string; imageUrl: string; url: string };

export type SteamNow = { isPlaying: true; game: Game } | { isPlaying: false; recent: Game | null };

export const steamIdle: SteamNow = { isPlaying: false, recent: null };

export const fillGame = (template: string, game: string) => template.replace("{game}", game);

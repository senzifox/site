export const WAVEFORM_BARS = 44;

export const waveformBars = Array.from({ length: WAVEFORM_BARS }, (_, id) => {
  const seed = Math.sin(id * 12.9898) * 43758.5453;
  const noise = seed - Math.floor(seed);
  const envelope = 0.55 + 0.45 * Math.sin((id / WAVEFORM_BARS) * Math.PI * 3 + 1);
  return { id, height: Math.round(18 + 82 * noise * envelope) };
});

export const isBarPlayed = (index: number, progress: number) => (index + 0.5) / WAVEFORM_BARS <= progress;

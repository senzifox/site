const TAU = Math.PI * 2;
const DENSITY = 0.09;
const SPEED = 9;
const LIFE_MIN = 0.7;
const LIFE_SPREAD = 1.6;
const SIZE_MIN = 0.7;
const SIZE_SPREAD = 0.8;

export type Mote = { x: number; y: number; vx: number; vy: number; age: number; life: number; size: number };

export type Dust = { width: number; height: number; motes: Mote[] };

type Random = () => number;

const spawn = (width: number, height: number, random: Random, born: boolean): Mote => {
  const angle = random() * TAU;
  const speed = SPEED * (0.3 + random() * 0.7);
  const life = LIFE_MIN + random() * LIFE_SPREAD;
  return {
    x: random() * width,
    y: random() * height,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    age: born ? 0 : random() * life,
    life,
    size: SIZE_MIN + random() * SIZE_SPREAD,
  };
};

export const createDust = (width: number, height: number, random: Random = Math.random): Dust => ({
  width,
  height,
  motes: Array.from({ length: Math.round(width * height * DENSITY) }, () =>
    spawn(width, height, random, false),
  ),
});

const outside = ({ x, y }: Mote, { width, height }: Dust) => x < 0 || x > width || y < 0 || y > height;

export const stepDust = (dust: Dust, dt: number, random: Random = Math.random) => {
  for (const [i, mote] of dust.motes.entries()) {
    mote.age += dt;
    mote.x += mote.vx * dt;
    mote.y += mote.vy * dt;
    if (mote.age >= mote.life || outside(mote, dust))
      dust.motes[i] = spawn(dust.width, dust.height, random, true);
  }
};

export const moteAlpha = ({ age, life }: Mote) => Math.sin((Math.PI * age) / life);

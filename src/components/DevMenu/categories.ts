import type { Tuning } from "@/lib/tuning";

export type Range = { label: string; min: number; max: number; step: number };

export type Section = { title: string; key: keyof Tuning; apply?: string; ranges: Record<string, Range> };

export type Category = { folder: string; actions?: Record<string, string>; sections: Section[] };

export const categories: Category[] = [
  {
    folder: "искры",
    actions: { бахнуть: "sparks.burst" },
    sections: [
      {
        title: "физика",
        key: "sparks",
        ranges: {
          cursorRadius: { label: "радиус курсора", min: 0, max: 240, step: 1 },
          push: { label: "толчок", min: 0, max: 20000, step: 100 },
          spring: { label: "пружина", min: 1, max: 200, step: 1 },
          damping: { label: "затухание", min: 0, max: 40, step: 0.5 },
          burst: { label: "сила вспышки", min: 0, max: 5000, step: 50 },
        },
      },
      {
        title: "вид",
        key: "sparkLook",
        ranges: {
          size: { label: "размер", min: 1, max: 40, step: 0.5 },
          speed: { label: "скорость", min: 0, max: 200, step: 1 },
          offset: { label: "отступ", min: 0, max: 200, step: 1 },
          spread: { label: "разброс отступа", min: 0, max: 400, step: 1 },
          margin: { label: "не ближе к контуру", min: 0, max: 120, step: 1 },
          wobble: { label: "покачивание", min: 0, max: 80, step: 1 },
          wobbleSpeed: { label: "темп покачивания", min: 0, max: 4, step: 0.05 },
          glow: { label: "яркость", min: 0, max: 1, step: 0.01 },
          twinkle: { label: "мерцание", min: 0, max: 1, step: 0.01 },
          twinkleSpeed: { label: "темп мерцания", min: 0, max: 8, step: 0.05 },
          heatGrow: { label: "рост от курсора", min: 0, max: 3, step: 0.05 },
          heatGlow: { label: "свет от курсора", min: 0, max: 1, step: 0.01 },
          heatDecay: { label: "остывание", min: 0.1, max: 12, step: 0.1 },
        },
      },
      {
        title: "раскладка",
        key: "sparkLayout",
        apply: "sparks.layout",
        ranges: {
          count: { label: "количество", min: 1, max: 80, step: 1 },
          trackSamples: { label: "точек контура", min: 60, max: 1500, step: 10 },
          smoothing: { label: "сглаживание", min: 1, max: 40, step: 1 },
          cropTouch: { label: "касание края", min: 0, max: 40, step: 1 },
          cropHide: { label: "скрыть у края", min: 0, max: 400, step: 5 },
          cropFade: { label: "затухание у края", min: 1, max: 600, step: 5 },
        },
      },
    ],
  },
  {
    folder: "аватарка",
    actions: { перевернуть: "avatar.flip", покачать: "avatar.peek", "сбросить «уже листал»": "avatar.unsee" },
    sections: [
      {
        title: "переворот",
        key: "flip",
        ranges: {
          ms: { label: "длительность, мс", min: 0, max: 2000, step: 10 },
          sharpness: { label: "резкость торможения", min: 1, max: 10, step: 0.5 },
        },
      },
      {
        title: "подсказка",
        key: "peek",
        ranges: {
          delay: { label: "первая через, мс", min: 0, max: 15000, step: 100 },
          every: { label: "повтор через, мс", min: 1000, max: 60000, step: 500 },
          limit: { label: "сколько раз", min: 0, max: 10, step: 1 },
          back: { label: "угол назад", min: 0, max: 90, step: 1 },
          backMs: { label: "назад, мс", min: 0, max: 1500, step: 10 },
          forth: { label: "угол вперёд", min: 0, max: 90, step: 1 },
          forthMs: { label: "вперёд, мс", min: 0, max: 1500, step: 10 },
          settleMs: { label: "возврат, мс", min: 0, max: 1500, step: 10 },
        },
      },
    ],
  },
  {
    folder: "эффекты",
    actions: { "показать вспышку": "copy.burst" },
    sections: [
      {
        title: "фонарик",
        key: "flashlight",
        ranges: {
          size: { label: "размер", min: 40, max: 1000, step: 10 },
          strength: { label: "яркость", min: 0, max: 1, step: 0.01 },
          falloff: { label: "яркость к краю", min: 0, max: 1, step: 0.01 },
          falloffAt: { label: "где край, %", min: 1, max: 99, step: 1 },
        },
      },
      {
        title: "подсветка карточек",
        key: "cardGlow",
        ranges: {
          ring: { label: "радиус рамки", min: 0, max: 600, step: 5 },
          ringStrength: { label: "яркость рамки", min: 0, max: 1, step: 0.01 },
          fill: { label: "радиус пятна", min: 0, max: 800, step: 5 },
          fillStrength: { label: "яркость пятна", min: 0, max: 0.5, step: 0.005 },
        },
      },
      {
        title: "вспышка копирования",
        key: "copyBurst",
        ranges: {
          count: { label: "количество", min: 1, max: 60, step: 1 },
          distance: { label: "дальность", min: 0, max: 200, step: 1 },
          duration: { label: "длительность, мс", min: 100, max: 3000, step: 10 },
          size: { label: "размер", min: 0.5, max: 12, step: 0.5 },
          drop: { label: "падение", min: -60, max: 80, step: 1 },
        },
      },
      {
        title: "фон",
        key: "background",
        apply: "background.repaint",
        ranges: {
          glow: { label: "свечение", min: 0, max: 2, step: 0.01 },
          parallax: { label: "параллакс точек", min: 0, max: 1, step: 0.01 },
          image: { label: "картинка", min: 0, max: 1, step: 0.01 },
          blur: { label: "размытие", min: 0, max: 40, step: 0.5 },
          focusX: { label: "фокус по X", min: 0, max: 100, step: 1 },
        },
      },
    ],
  },
  {
    folder: "шапка и футер",
    sections: [
      {
        title: "сменяемая строка",
        key: "header",
        ranges: {
          showMs: { label: "показ, мс", min: 500, max: 15000, step: 100 },
          fadeMs: { label: "смена, мс", min: 0, max: 3000, step: 50 },
        },
      },
      {
        title: "блок шапки",
        key: "headerCard",
        ranges: {
          tint: { label: "тёмный тон", min: 0, max: 1, step: 0.01 },
          blur: { label: "размытие", min: 0, max: 40, step: 0.5 },
          accent: { label: "рыжий отлив", min: 0, max: 1, step: 0.01 },
          edge: { label: "рыжая кромка", min: 0, max: 1, step: 0.01 },
        },
      },
      {
        title: "хвост",
        key: "tail",
        apply: "tail.tempo",
        ranges: {
          seconds: { label: "цикл, с", min: 0.5, max: 12, step: 0.1 },
        },
      },
    ],
  },
];

export const controlKey = (section: Section, key: string) => `${section.key}_${key}`;

export const controlPath = (category: Category, section: Section, key: string) =>
  `${category.folder}.${section.title}.${controlKey(section, key)}`;

export const levaKeys = (category: Category) => [
  ...Object.keys(category.actions ?? {}),
  ...category.sections.flatMap((section) => [
    section.title,
    ...Object.keys(section.ranges).map((key) => controlKey(section, key)),
  ]),
];

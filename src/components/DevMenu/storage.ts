import { applyTuning, tuning } from "@/lib/tuning";

const STORAGE_KEY = "dev:tuning";
const SAVE_DELAY = 200;

export const restore = () => {
  try {
    applyTuning(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"));
  } catch {
    return;
  }
};

let saveTimer: ReturnType<typeof setTimeout> | undefined;

export const save = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tuning));
    } catch {
      return;
    }
  }, SAVE_DELAY);
};

export const forget = () => {
  clearTimeout(saveTimer);
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
};

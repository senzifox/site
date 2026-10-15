import { afterEach, describe, expect, it } from "vitest";
import { applyTuning, defaults, registerAction, resetTuning, runAction, tuning } from "./tuning";

afterEach(resetTuning);

describe("applyTuning", () => {
  it("takes known values of the same type", () => {
    applyTuning({ sparks: { spring: 60, push: 100 } });
    expect(tuning.sparks.spring).toBe(60);
    expect(tuning.sparks.push).toBe(100);
  });

  it("ignores unknown keys, wrong types and junk", () => {
    applyTuning({ sparks: { spring: "60", extra: 1 }, other: { a: 1 } });
    applyTuning(null);
    applyTuning("sparks");
    expect(tuning).toEqual(defaults);
  });
});

describe("resetTuning", () => {
  it("brings values back to defaults without replacing the object", () => {
    const sparks = tuning.sparks;
    applyTuning({ sparks: { damping: 1 } });
    resetTuning();
    expect(tuning.sparks).toBe(sparks);
    expect(tuning).toEqual(defaults);
  });
});

describe("actions", () => {
  it("runs the registered handler until it unregisters", () => {
    let runs = 0;
    const unregister = registerAction("test", () => {
      runs += 1;
    });
    runAction("test");
    unregister();
    runAction("test");
    expect(runs).toBe(1);
  });
});

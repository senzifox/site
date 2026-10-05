import { describe, expect, it, vi } from "vitest";
import { cached } from "./cache";
import { HttpError } from "./http";

describe("cached", () => {
  it("reuses the value until it expires and reports when it was fetched", async () => {
    let time = 0;
    const load = vi.fn(async () => time);
    const get = cached(load, { ttlMs: 10_000, errorTtlMs: 1_000, now: () => time });

    expect(await get()).toEqual({ data: 0, fetchedAt: 0 });
    time = 5_000;
    expect(await get()).toEqual({ data: 0, fetchedAt: 0 });
    time = 10_001;
    expect(await get()).toEqual({ data: 10_001, fetchedAt: 10_001 });
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("shares one in-flight request between callers", async () => {
    let resolve: (value: string) => void = () => {};
    const load = vi.fn(() => new Promise<string>((r) => (resolve = r)));
    const get = cached(load, { ttlMs: 1_000, errorTtlMs: 1_000 });

    const both = Promise.all([get(), get()]);
    resolve("track");
    expect((await both).map((r) => r.data)).toEqual(["track", "track"]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("backs off after a failure before retrying", async () => {
    let time = 0;
    const load = vi.fn().mockRejectedValueOnce(new Error("down")).mockResolvedValueOnce("ok");
    const get = cached(load, { ttlMs: 1_000, errorTtlMs: 5_000, now: () => time });

    await expect(get()).rejects.toThrow("down");
    time = 4_000;
    await expect(get()).rejects.toThrow("down");
    expect(load).toHaveBeenCalledTimes(1);
    time = 5_001;
    expect((await get()).data).toBe("ok");
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("honours retryAfterMs on the error", async () => {
    let time = 0;
    const limited = new HttpError(
      "429",
      new Response(null, { status: 429, headers: { "retry-after": "30" } }),
    );
    const load = vi.fn().mockRejectedValueOnce(limited).mockResolvedValueOnce("ok");
    const get = cached(load, { ttlMs: 1_000, errorTtlMs: 5_000, now: () => time });

    await expect(get()).rejects.toThrow("429");
    time = 29_000;
    await expect(get()).rejects.toThrow("429");
    time = 30_001;
    expect((await get()).data).toBe("ok");
  });

  it("serves the last value while refreshes fail, within the stale window", async () => {
    let time = 0;
    const load = vi.fn().mockResolvedValueOnce("old").mockRejectedValue(new Error("down"));
    const get = cached(load, { ttlMs: 1_000, errorTtlMs: 5_000, staleMs: 10_000, now: () => time });
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});

    expect((await get()).data).toBe("old");
    time = 2_000;
    expect((await get()).data).toBe("old");
    time = 4_000;
    expect((await get()).data).toBe("old");
    expect(load).toHaveBeenCalledTimes(2);
    time = 11_001;
    await expect(get()).rejects.toThrow("down");
    quiet.mockRestore();
  });
});

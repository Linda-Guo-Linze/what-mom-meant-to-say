import { describe, expect, it } from "vitest";
import { consumeLiveRequest } from "../../src/lib/rate-limit";

describe("Live AI server limits", () => {
  it("allows ten requests per IP each hour, then falls back", () => {
    for (let index = 0; index < 10; index += 1) expect(consumeLiveRequest("test-ip").allowed).toBe(true);
    expect(consumeLiveRequest("test-ip").allowed).toBe(false);
  });
});

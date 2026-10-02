import { describe, expect, it } from "vitest";

import {
  COMMON_MASKS,
  composeMask,
  describeMask,
  NUMPAD_TO_MASK,
} from "./masks";

describe("input masks", () => {
  it("maps all numpad notation directly to relative directions", () => {
    expect(NUMPAD_TO_MASK).toEqual({
      1: 6,
      2: 2,
      3: 10,
      4: 4,
      5: 0,
      6: 8,
      7: 5,
      8: 1,
      9: 9,
    });
  });

  it("composes directions and buttons with OR", () => {
    expect(composeMask(2, ["LK"])).toBe(130);
    expect(composeMask(6, ["HP"])).toBe(72);
    expect(composeMask(4, ["MK", "HK"])).toBe(772);
  });

  it("defines the confirmed combinations", () => {
    expect(COMMON_MASKS).toMatchObject({
      throw: 144,
      parry: 288,
      driveImpact: 576,
      odPunch: 96,
      odKick: 768,
    });
  });

  it("describes and preserves unknown bits", () => {
    const result = describeMask(3 | 16 | 1024);

    expect(result.direction).toBeNull();
    expect(result.buttons).toEqual(["LP"]);
    expect(result.preservedBits).toBe(1027);
  });
});

import { describe, expect, it } from "vitest";

import { INPUT_PRESETS } from "./presets";

describe("presets", () => {
  it("uses relative motions in numpad notation", () => {
    expect(
      INPUT_PRESETS["quarter-circle-forward"].blocks.map(({ mask }) => mask),
    ).toEqual([2, 10, 24, 0]);
    expect(
      INPUT_PRESETS["dragon-punch"].blocks.map(({ mask }) => mask),
    ).toEqual([8, 2, 26, 0]);
  });

  it("uses combinations instead of special bits for SF6 actions", () => {
    expect(INPUT_PRESETS.throw.blocks[0].mask).toBe(144);
    expect(INPUT_PRESETS.parry.blocks[0].mask).toBe(288);
    expect(INPUT_PRESETS["drive-impact"].blocks[0].mask).toBe(576);
  });
});

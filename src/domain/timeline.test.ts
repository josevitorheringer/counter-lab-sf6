import { describe, expect, it } from "vitest";

import {
  compactBlocks,
  decodeFlatRle,
  encodeFlatRle,
  encodeRawInputs,
  expandBlocks,
  flatRleToBlocks,
} from "./timeline";

describe("timeline", () => {
  it("converts raw_inputs to blocks and back without loss", () => {
    const raw = [2, 2, 2, 2, 10, 10, 10, 10, 10, 8, 72, 72];
    const blocks = encodeRawInputs(raw);

    expect(blocks).toEqual([
      { frames: 4, mask: 2 },
      { frames: 5, mask: 10 },
      { frames: 1, mask: 8 },
      { frames: 2, mask: 72 },
    ]);
    expect(expandBlocks(blocks)).toEqual(raw);
  });

  it("compacts adjacent blocks with the same mask", () => {
    expect(
      compactBlocks([
        { frames: 2, mask: 8 },
        { frames: 3, mask: 8 },
        { frames: 1, mask: 0 },
      ]),
    ).toEqual([
      { frames: 5, mask: 8 },
      { frames: 1, mask: 0 },
    ]);
  });

  it("encodes and decodes flat v2 RLE", () => {
    const raw = [0, 0, 0, 16, 16, 0];
    expect(encodeFlatRle(raw)).toEqual([3, 0, 2, 16, 1, 0]);
    expect(decodeFlatRle([3, 0, 2, 16, 1, 0])).toEqual(raw);
  });

  it("rejects incomplete RLE or invalid duration", () => {
    expect(() => flatRleToBlocks([2, 8, 1])).toThrow(/pairs/);
    expect(() => flatRleToBlocks([0, 8])).toThrow(/greater than zero/);
  });
});

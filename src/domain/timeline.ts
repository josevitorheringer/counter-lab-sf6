import type { InputBlock, RecordingSlot } from "./types";
import { DrillValidationError } from "./validation";

function assertMask(mask: number, label = "Mask"): void {
  if (!Number.isInteger(mask) || mask < 0 || mask > 65535) {
    throw new DrillValidationError(`${label} must be an integer between 0 and 65535.`);
  }
}

function assertFrames(frames: number, label = "Duration"): void {
  if (!Number.isInteger(frames) || frames <= 0) {
    throw new DrillValidationError(`${label} must be an integer greater than zero.`);
  }
}

export function encodeRawInputs(rawInputs: readonly number[]): InputBlock[] {
  const blocks: InputBlock[] = [];

  rawInputs.forEach((mask, index) => {
    assertMask(mask, `Mask at frame ${index + 1}`);
    const previous = blocks.at(-1);
    if (previous?.mask === mask) {
      previous.frames += 1;
    } else {
      blocks.push({ frames: 1, mask });
    }
  });

  return blocks;
}

export function expandBlocks(blocks: readonly InputBlock[]): number[] {
  const rawInputs: number[] = [];

  blocks.forEach(({ frames, mask }, index) => {
    assertFrames(frames, `Duration of block ${index + 1}`);
    assertMask(mask, `Mask of block ${index + 1}`);
    for (let frame = 0; frame < frames; frame += 1) rawInputs.push(mask);
  });

  return rawInputs;
}

export function compactBlocks(blocks: readonly InputBlock[]): InputBlock[] {
  const compacted: InputBlock[] = [];

  blocks.forEach(({ frames, mask }, index) => {
    assertFrames(frames, `Duration of block ${index + 1}`);
    assertMask(mask, `Mask of block ${index + 1}`);
    const previous = compacted.at(-1);
    if (previous?.mask === mask) {
      previous.frames += frames;
    } else {
      compacted.push({ frames, mask });
    }
  });

  return compacted;
}

export function blocksToFlatRle(blocks: readonly InputBlock[]): number[] {
  return compactBlocks(blocks).flatMap(({ frames, mask }) => [frames, mask]);
}

export function flatRleToBlocks(rle: readonly number[]): InputBlock[] {
  if (rle.length % 2 !== 0) {
    throw new DrillValidationError("The RLE sequence must contain [count, value] pairs.");
  }

  const blocks: InputBlock[] = [];
  for (let index = 0; index < rle.length; index += 2) {
    const frames = rle[index];
    const mask = rle[index + 1];
    assertFrames(frames, `RLE count in pair ${index / 2 + 1}`);
    assertMask(mask, `RLE value in pair ${index / 2 + 1}`);
    blocks.push({ frames, mask });
  }
  return compactBlocks(blocks);
}

export function decodeFlatRle(rle: readonly number[]): number[] {
  return expandBlocks(flatRleToBlocks(rle));
}

export function encodeFlatRle(rawInputs: readonly number[]): number[] {
  return blocksToFlatRle(encodeRawInputs(rawInputs));
}

export function countFrames(blocks: readonly InputBlock[]): number {
  return blocks.reduce((total, block, index) => {
    assertFrames(block.frames, `Duration of block ${index + 1}`);
    return total + block.frames;
  }, 0);
}

export function setSlotBlocks(
  slot: RecordingSlot,
  blocks: readonly InputBlock[],
): RecordingSlot {
  const rawInputs = expandBlocks(compactBlocks(blocks));
  const hasFrames = rawInputs.length > 0;

  return {
    ...structuredClone(slot),
    raw_inputs: rawInputs,
    frame_count: rawInputs.length,
    is_valid: hasFrames,
    state: hasFrames ? 1 : 0,
  };
}

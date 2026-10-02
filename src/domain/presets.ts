import { COMMON_MASKS, composeMask } from "./masks";
import type { InputBlock } from "./types";

export type InputPresetId =
  | "dash"
  | "quarter-circle-forward"
  | "dragon-punch"
  | "throw"
  | "parry"
  | "drive-impact";

export type InputPreset = {
  id: InputPresetId;
  label: string;
  blocks: readonly InputBlock[];
};

export const INPUT_PRESETS: Readonly<Record<InputPresetId, InputPreset>> = {
  dash: {
    id: "dash",
    label: "Dash",
    blocks: [
      { frames: 2, mask: composeMask(6) },
      { frames: 1, mask: composeMask(5) },
      { frames: 2, mask: composeMask(6) },
      { frames: 8, mask: composeMask(5) },
    ],
  },
  "quarter-circle-forward": {
    id: "quarter-circle-forward",
    label: "Quarter-circle forward + LP",
    blocks: [
      { frames: 2, mask: composeMask(2) },
      { frames: 2, mask: composeMask(3) },
      { frames: 1, mask: composeMask(6, ["LP"]) },
      { frames: 8, mask: composeMask(5) },
    ],
  },
  "dragon-punch": {
    id: "dragon-punch",
    label: "Dragon punch + LP",
    blocks: [
      { frames: 2, mask: composeMask(6) },
      { frames: 2, mask: composeMask(2) },
      { frames: 1, mask: composeMask(3, ["LP"]) },
      { frames: 8, mask: composeMask(5) },
    ],
  },
  throw: {
    id: "throw",
    label: "Throw",
    blocks: [
      { frames: 1, mask: COMMON_MASKS.throw },
      { frames: 12, mask: 0 },
    ],
  },
  parry: {
    id: "parry",
    label: "Drive Parry",
    blocks: [
      { frames: 3, mask: COMMON_MASKS.parry },
      { frames: 8, mask: 0 },
    ],
  },
  "drive-impact": {
    id: "drive-impact",
    label: "Drive Impact",
    blocks: [
      { frames: 1, mask: COMMON_MASKS.driveImpact },
      { frames: 30, mask: 0 },
    ],
  },
};

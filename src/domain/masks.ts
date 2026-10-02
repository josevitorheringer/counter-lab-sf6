export const INPUT_BITS = {
  up: 1,
  down: 2,
  back: 4,
  forward: 8,
  LP: 16,
  MP: 32,
  HP: 64,
  LK: 128,
  MK: 256,
  HK: 512,
} as const;

export type AttackButton = "LP" | "MP" | "HP" | "LK" | "MK" | "HK";
export type NumpadDirection = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const NUMPAD_TO_MASK: Readonly<Record<NumpadDirection, number>> = {
  1: INPUT_BITS.down | INPUT_BITS.back,
  2: INPUT_BITS.down,
  3: INPUT_BITS.down | INPUT_BITS.forward,
  4: INPUT_BITS.back,
  5: 0,
  6: INPUT_BITS.forward,
  7: INPUT_BITS.up | INPUT_BITS.back,
  8: INPUT_BITS.up,
  9: INPUT_BITS.up | INPUT_BITS.forward,
};

export const BUTTON_TO_MASK: Readonly<Record<AttackButton, number>> = {
  LP: INPUT_BITS.LP,
  MP: INPUT_BITS.MP,
  HP: INPUT_BITS.HP,
  LK: INPUT_BITS.LK,
  MK: INPUT_BITS.MK,
  HK: INPUT_BITS.HK,
};

export const ATTACK_BUTTONS = Object.keys(BUTTON_TO_MASK) as AttackButton[];
export const DIRECTION_MASK = 15;
export const BUTTON_MASK = 1008;
export const KNOWN_INPUT_MASK = DIRECTION_MASK | BUTTON_MASK;

const MASK_TO_NUMPAD = new Map<number, NumpadDirection>(
  Object.entries(NUMPAD_TO_MASK).map(([direction, mask]) => [
    mask,
    Number(direction) as NumpadDirection,
  ]),
);

const DIRECTION_LABELS: Readonly<Record<NumpadDirection, string>> = {
  1: "Down-back",
  2: "Down",
  3: "Down-forward",
  4: "Back",
  5: "Neutral",
  6: "Forward",
  7: "Up-back",
  8: "Up",
  9: "Up-forward",
};

const BUTTON_LABELS: Readonly<Record<AttackButton, string>> = {
  LP: "light punch",
  MP: "medium punch",
  HP: "heavy punch",
  LK: "light kick",
  MK: "medium kick",
  HK: "heavy kick",
};

export type InputMaskDescription = {
  mask: number;
  direction: NumpadDirection | null;
  buttons: AttackButton[];
  preservedBits: number;
  shortLabel: string;
  accessibleLabel: string;
};

function assertInputMask(mask: number): void {
  if (!Number.isInteger(mask) || mask < 0 || mask > 65535) {
    throw new RangeError("The mask must be an integer between 0 and 65535.");
  }
}

export function describeMask(mask: number): InputMaskDescription {
  assertInputMask(mask);
  const directionBits = mask & DIRECTION_MASK;
  const direction = MASK_TO_NUMPAD.get(directionBits) ?? null;
  const buttons = ATTACK_BUTTONS.filter(
    (button) => (mask & BUTTON_TO_MASK[button]) !== 0,
  );
  const invalidDirectionBits = direction === null ? directionBits : 0;
  const preservedBits = (mask & ~KNOWN_INPUT_MASK) | invalidDirectionBits;
  const directionShort = direction ?? `D${directionBits}`;
  const shortLabel = `${directionShort}${buttons.length > 0 ? buttons.join("+") : ""}`;
  const accessibleParts = [
    direction === null ? `Unknown direction ${directionBits}` : DIRECTION_LABELS[direction],
    ...buttons.map((button) => BUTTON_LABELS[button]),
    preservedBits !== 0 ? `preserved bits ${preservedBits}` : "",
  ].filter(Boolean);

  return {
    mask,
    direction,
    buttons,
    preservedBits,
    shortLabel,
    accessibleLabel: accessibleParts.join(" + "),
  };
}

export function composeMask(
  direction: NumpadDirection,
  buttons: readonly AttackButton[] = [],
  preservedBits = 0,
): number {
  assertInputMask(preservedBits);
  const mask = buttons.reduce(
    (result, button) => result | BUTTON_TO_MASK[button],
    NUMPAD_TO_MASK[direction] | preservedBits,
  );
  assertInputMask(mask);
  return mask;
}

export const COMMON_MASKS = {
  throw: INPUT_BITS.LP | INPUT_BITS.LK,
  parry: INPUT_BITS.MP | INPUT_BITS.MK,
  driveImpact: INPUT_BITS.HP | INPUT_BITS.HK,
  odPunch: INPUT_BITS.MP | INPUT_BITS.HP,
  odKick: INPUT_BITS.MK | INPUT_BITS.HK,
} as const;

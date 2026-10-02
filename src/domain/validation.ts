import type {
  DrillDocument,
  JsonObject,
  RecordingSlot,
  ReversalData,
  ReversalSlots,
  SlotGuid,
} from "./types";

const SLOT_COUNT = 8;
const REVERSAL_COUNT = 10;

export class DrillValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DrillValidationError";
  }
}

export const RECORDED_SLOT_GUID: SlotGuid = {
  mData1: 231974219,
  mData2: 56247,
  mData3: 18493,
  mData4_0: 138,
  mData4_1: 211,
  mData4_2: 88,
  mData4_3: 121,
  mData4_4: 158,
  mData4_5: 17,
  mData4_6: 216,
  mData4_7: 197,
};

export const EMPTY_SLOT_GUID: SlotGuid = {
  mData1: 0,
  mData2: 0,
  mData3: 0,
  mData4_0: 0,
  mData4_1: 0,
  mData4_2: 0,
  mData4_3: 0,
  mData4_4: 0,
  mData4_5: 0,
  mData4_6: 0,
  mData4_7: 0,
};

export const EMPTY_REVERSAL: ReversalData = {
  Type: -1,
  SkillIndex: -1,
  IsValid: false,
  IsActive: false,
  IsFrame: false,
  Frame: 0,
  Delay: 0,
  Count: 1,
  Level: 0,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneRecord(value: Record<string, unknown>): Record<string, unknown> {
  return structuredClone(value);
}

function requireInteger(
  value: unknown,
  label: string,
  minimum?: number,
  maximum?: number,
): number {
  if (!Number.isInteger(value)) {
    throw new DrillValidationError(`${label} must be an integer.`);
  }

  const integer = value as number;
  if (minimum !== undefined && integer < minimum) {
    throw new DrillValidationError(`${label} must be at least ${minimum}.`);
  }
  if (maximum !== undefined && integer > maximum) {
    throw new DrillValidationError(`${label} must be at most ${maximum}.`);
  }
  return integer;
}

function optionalInteger(
  value: unknown,
  fallback: number,
  label: string,
  minimum?: number,
): number {
  return value === undefined ? fallback : requireInteger(value, label, minimum);
}

function optionalBoolean(value: unknown, fallback: boolean, label: string): boolean {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") {
    throw new DrillValidationError(`${label} must be true or false.`);
  }
  return value;
}

function optionalString(value: unknown, label: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new DrillValidationError(`${label} must be a string.`);
  }
  return value;
}

function normalizeMetadata(value: Record<string, unknown>): Record<string, unknown> {
  const metadata = cloneRecord(value);
  for (const key of ["id", "author", "description", "created_at"] as const) {
    const normalized = optionalString(metadata[key], `metadata.${key}`);
    if (normalized !== undefined) metadata[key] = normalized;
  }
  if (metadata.tags !== undefined) {
    if (
      !Array.isArray(metadata.tags) ||
      !metadata.tags.every((tag) => typeof tag === "string")
    ) {
      throw new DrillValidationError("metadata.tags must be an array of strings.");
    }
  }
  return metadata;
}

function normalizeCompatibility(value: Record<string, unknown>): Record<string, unknown> {
  const compatibility = cloneRecord(value);
  compatibility.dummy_character_id = requireInteger(
    value.dummy_character_id,
    "compatibility.dummy_character_id",
    1,
  );
  const dummyName = optionalString(
    value.dummy_character_name,
    "compatibility.dummy_character_name",
  );
  if (dummyName !== undefined) compatibility.dummy_character_name = dummyName;
  if (value.player_character_id !== undefined) {
    compatibility.player_character_id = requireInteger(
      value.player_character_id,
      "compatibility.player_character_id",
      1,
    );
  }
  return compatibility;
}

const TRAINING_INTEGER_FIELDS = [
  "dummy_stance",
  "dummy_guard",
  "dummy_guard_switch",
  "block_count",
  "block_type",
  "drive_reversal",
  "drive_reversal_delay",
  "drive_reversal_count",
  "throw_escape",
  "dummy_recovery",
  "dummy_counter",
  "dummy_counter_nc",
  "dummy_counter_pc",
  "player_drive_gauge",
  "dummy_drive_gauge",
  "player_super_gauge",
  "dummy_super_gauge",
] as const;

function normalizeTrainingSettings(value: unknown): Record<string, unknown> | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    throw new DrillValidationError("training_settings must be an object.");
  }
  const settings = cloneRecord(value);
  for (const key of TRAINING_INTEGER_FIELDS) {
    if (settings[key] !== undefined) {
      settings[key] = requireInteger(settings[key], `training_settings.${key}`);
    }
  }
  if (
    settings.switch_block_active !== undefined &&
    typeof settings.switch_block_active !== "boolean" &&
    settings.switch_block_active !== 0 &&
    settings.switch_block_active !== 1
  ) {
    throw new DrillValidationError(
      "training_settings.switch_block_active must be a boolean, 0, or 1.",
    );
  }
  const stagePosition = optionalString(
    settings.stage_position,
    "training_settings.stage_position",
  );
  if (stagePosition !== undefined) settings.stage_position = stagePosition;
  return settings;
}

function normalizeGlobalSettings(value: unknown): Record<string, unknown> | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    throw new DrillValidationError("action_record.global_settings must be an object.");
  }
  const settings = cloneRecord(value);
  for (const key of [
    "info_type",
    "loop_type",
    "play_type",
    "record_countdown",
    "record_start_type",
    "record_type",
  ] as const) {
    if (settings[key] !== undefined) {
      settings[key] = requireInteger(settings[key], `global_settings.${key}`);
    }
  }
  return settings;
}

function normalizeGuid(value: unknown, recorded: boolean): SlotGuid {
  const fallback = recorded ? RECORDED_SLOT_GUID : EMPTY_SLOT_GUID;
  if (value === undefined) return structuredClone(fallback);
  if (!isRecord(value)) {
    throw new DrillValidationError("The slot title must be a GUID object.");
  }

  const normalized = { ...fallback, ...cloneRecord(value) } as SlotGuid;
  for (const key of Object.keys(fallback)) {
    normalized[key] = requireInteger(
      normalized[key],
      `title.${key}`,
    );
  }
  return normalized;
}

export function createEmptySlot(slotIndex: number): RecordingSlot {
  return {
    slot_index: slotIndex,
    raw_inputs: [],
    frame_count: 0,
    is_active: false,
    is_valid: false,
    weight: 1,
    state: 0,
    is_loop: false,
    cmd_type: 0,
    negative_edge: false,
    title: structuredClone(EMPTY_SLOT_GUID),
  };
}

function normalizeSlot(value: unknown, fallbackIndex: number): RecordingSlot {
  if (!isRecord(value)) {
    throw new DrillValidationError(`Slot ${fallbackIndex} must be an object.`);
  }

  const slotIndex = optionalInteger(
    value.slot_index,
    fallbackIndex,
    `slot_index of Slot ${fallbackIndex}`,
    1,
  );
  if (slotIndex > SLOT_COUNT) {
    throw new DrillValidationError(`slot_index ${slotIndex} is outside the 1–8 range.`);
  }

  const raw = value.raw_inputs ?? [];
  if (!Array.isArray(raw)) {
    throw new DrillValidationError(`raw_inputs of Slot ${slotIndex} must be an array.`);
  }
  const rawInputs = raw.map((mask, frameIndex) =>
    requireInteger(
      mask,
      `raw_inputs of Slot ${slotIndex}, frame ${frameIndex + 1}`,
      0,
      65535,
    ),
  );

  if (value.frame_count !== undefined) {
    requireInteger(value.frame_count, `frame_count of Slot ${slotIndex}`, 0);
  }

  const hasFrames = rawInputs.length > 0;
  const weight = Math.max(
    1,
    optionalInteger(value.weight, 1, `weight of Slot ${slotIndex}`, 0),
  );

  return {
    ...cloneRecord(value),
    slot_index: slotIndex,
    raw_inputs: rawInputs,
    frame_count: rawInputs.length,
    is_active: optionalBoolean(
      value.is_active,
      false,
      `is_active of Slot ${slotIndex}`,
    ),
    is_valid: optionalBoolean(
      value.is_valid,
      hasFrames,
      `is_valid of Slot ${slotIndex}`,
    ),
    weight,
    state: optionalInteger(
      value.state,
      hasFrames ? 1 : 0,
      `state of Slot ${slotIndex}`,
    ),
    is_loop: optionalBoolean(
      value.is_loop,
      false,
      `is_loop of Slot ${slotIndex}`,
    ),
    cmd_type: optionalInteger(
      value.cmd_type,
      0,
      `cmd_type of Slot ${slotIndex}`,
    ),
    negative_edge: optionalBoolean(
      value.negative_edge,
      false,
      `negative_edge of Slot ${slotIndex}`,
    ),
    title: normalizeGuid(value.title, hasFrames),
  } as RecordingSlot;
}

function normalizeReversalEntry(value: unknown): ReversalData {
  if (value === undefined) return structuredClone(EMPTY_REVERSAL);
  if (!isRecord(value)) {
    throw new DrillValidationError("Each reversal slot must be an object.");
  }

  const normalized = { ...EMPTY_REVERSAL, ...cloneRecord(value) } as ReversalData;
  for (const key of ["Type", "SkillIndex", "Frame", "Delay", "Count", "Level"] as const) {
    normalized[key] = requireInteger(normalized[key], `reversal.${key}`);
  }
  for (const key of ["IsValid", "IsActive", "IsFrame"] as const) {
    normalized[key] = optionalBoolean(normalized[key], false, `reversal.${key}`);
  }
  return normalized;
}

function normalizeReversalList(value: unknown, label: string): ReversalData[] {
  if (value === undefined) {
    return Array.from({ length: REVERSAL_COUNT }, () =>
      structuredClone(EMPTY_REVERSAL),
    );
  }
  if (!Array.isArray(value)) {
    throw new DrillValidationError(`reversal_slots.${label} must be an array.`);
  }
  if (value.length > REVERSAL_COUNT) {
    throw new DrillValidationError(`reversal_slots.${label} supports at most 10 entries.`);
  }
  return Array.from({ length: REVERSAL_COUNT }, (_, index) =>
    normalizeReversalEntry(value[index]),
  );
}

function normalizeReversalSlots(value: unknown): ReversalSlots | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    throw new DrillValidationError("reversal_slots must be an object.");
  }
  return {
    ...cloneRecord(value),
    down: normalizeReversalList(value.down, "down"),
    guard: normalizeReversalList(value.guard, "guard"),
    damage: normalizeReversalList(value.damage, "damage"),
  } as ReversalSlots;
}

export function normalizeDrill(value: unknown): DrillDocument {
  if (!isRecord(value)) {
    throw new DrillValidationError("The drill must be a JSON object.");
  }
  if (value.version !== 1) {
    throw new DrillValidationError("The schema version must be 1.");
  }
  if (!isRecord(value.metadata)) {
    throw new DrillValidationError("metadata must be an object.");
  }
  if (typeof value.metadata.title !== "string" || value.metadata.title.trim() === "") {
    throw new DrillValidationError("metadata.title is required.");
  }
  if (!isRecord(value.compatibility)) {
    throw new DrillValidationError("compatibility must be an object.");
  }
  const compatibility = normalizeCompatibility(value.compatibility);
  if (!isRecord(value.action_record)) {
    throw new DrillValidationError("action_record must be an object.");
  }

  const rawSlots = value.action_record.slots ?? [];
  if (!Array.isArray(rawSlots)) {
    throw new DrillValidationError("action_record.slots must be an array in the long-form schema.");
  }
  if (rawSlots.length > SLOT_COUNT) {
    throw new DrillValidationError("A drill supports at most eight slots.");
  }

  const slotsByIndex = new Map<number, RecordingSlot>();
  rawSlots.forEach((slot, index) => {
    const normalized = normalizeSlot(slot, index + 1);
    if (slotsByIndex.has(normalized.slot_index)) {
      throw new DrillValidationError(
        `slot_index ${normalized.slot_index} appears more than once.`,
      );
    }
    slotsByIndex.set(normalized.slot_index, normalized);
  });
  const slots = Array.from({ length: SLOT_COUNT }, (_, index) =>
    slotsByIndex.get(index + 1) ?? createEmptySlot(index + 1),
  );

  const actionRecord = cloneRecord(value.action_record);
  const reversalSlots = normalizeReversalSlots(value.action_record.reversal_slots);
  const globalSettings = normalizeGlobalSettings(value.action_record.global_settings);
  if (value.action_record.playback_mode !== undefined) {
    actionRecord.playback_mode = requireInteger(
      value.action_record.playback_mode,
      "action_record.playback_mode",
    );
  }
  if (globalSettings !== undefined) actionRecord.global_settings = globalSettings;
  actionRecord.slots = slots;
  if (reversalSlots !== undefined) actionRecord.reversal_slots = reversalSlots;

  return {
    ...cloneRecord(value),
    version: 1,
    metadata: normalizeMetadata(value.metadata),
    compatibility,
    training_settings: normalizeTrainingSettings(value.training_settings),
    action_record: actionRecord,
  } as DrillDocument;
}

export function validateDrill(value: unknown): asserts value is DrillDocument {
  normalizeDrill(value);
}

export function isDefaultRecordedGuid(value: SlotGuid): boolean {
  return Object.entries(RECORDED_SLOT_GUID).every(
    ([key, expected]) => value[key] === expected,
  );
}

export function isDefaultReversal(value: ReversalData): boolean {
  const keys = Object.keys(value);
  const defaultKeys = Object.keys(EMPTY_REVERSAL);
  return (
    keys.length === defaultKeys.length &&
    defaultKeys.every((key) => value[key] === EMPTY_REVERSAL[key])
  );
}

export const DRILL_SLOT_COUNT = SLOT_COUNT;
export const REVERSAL_SLOT_COUNT = REVERSAL_COUNT;
export type { JsonObject };

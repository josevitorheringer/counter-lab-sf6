import { decodeFlatRle, encodeFlatRle } from "./timeline";
import type {
  DrillDocument,
  ImportResult,
  JsonObject,
  RecordingSlot,
  ReversalData,
  ReversalSlots,
} from "./types";
import {
  DRILL_SLOT_COUNT,
  DrillValidationError,
  EMPTY_REVERSAL,
  isDefaultRecordedGuid,
  isDefaultReversal,
  normalizeDrill,
  REVERSAL_SLOT_COUNT,
} from "./validation";

const V1_PREFIX = "SF6DRILL:v1:";
const V2_PREFIX = "SF6DRILL:v2:";

const METADATA_KEYS = {
  id: "i",
  title: "t",
  author: "a",
  description: "d",
  created_at: "c",
  tags: "g",
} as const;

const COMPATIBILITY_KEYS = {
  dummy_character_id: "d",
  dummy_character_name: "n",
  player_character_id: "p",
} as const;

const TRAINING_KEYS = {
  dummy_stance: "ds",
  dummy_guard: "dg",
  dummy_guard_switch: "dw",
  block_count: "bc",
  switch_block_active: "sw",
  block_type: "bt",
  drive_reversal: "dr",
  drive_reversal_delay: "dl",
  drive_reversal_count: "dc",
  throw_escape: "te",
  dummy_recovery: "dv",
  dummy_counter: "cn",
  dummy_counter_nc: "nc",
  dummy_counter_pc: "pc",
  player_drive_gauge: "pg",
  dummy_drive_gauge: "gg",
  player_super_gauge: "ps",
  dummy_super_gauge: "gs",
  stage_position: "sp",
} as const;

const GLOBAL_KEYS = {
  info_type: "i",
  loop_type: "l",
  play_type: "p",
  record_countdown: "c",
  record_start_type: "s",
  record_type: "t",
} as const;

const SLOT_KEYS = {
  slot_index: "i",
  cmd_type: "c",
  is_active: "a",
  is_loop: "o",
  is_valid: "v",
  negative_edge: "e",
  state: "s",
  weight: "w",
  frame_count: "f",
  raw_inputs: "r",
  title: "t",
} as const;

const REVERSAL_KEYS = {
  Count: "c",
  Delay: "d",
  Frame: "f",
  IsActive: "a",
  IsFrame: "g",
  IsValid: "v",
  Level: "l",
  SkillIndex: "k",
  Type: "t",
} as const;

type KeyMap = Readonly<Record<string, string>>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new DrillValidationError(`${label} must be an object.`);
  }
  return value;
}

function renameKeys(value: Record<string, unknown>, keys: KeyMap): JsonObject {
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [keys[key] ?? key, entry]),
  ) as JsonObject;
}

function invertKeys(keys: KeyMap): Record<string, string> {
  return Object.fromEntries(Object.entries(keys).map(([long, short]) => [short, long]));
}

function expandKeys(value: unknown, keys: KeyMap, label: string): JsonObject {
  return renameKeys(requireRecord(value, label), invertKeys(keys));
}

function stripClipboardSuffix(value: string): string {
  return value.replace(/(?:\\?\*)+\s*$/u, "").trim();
}

export function encodeBase64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

export function decodeBase64Utf8(value: string): string {
  let normalized = value.replace(/\s/gu, "");
  if (!/^[A-Za-z0-9+/]*={0,2}$/u.test(normalized) || normalized.length % 4 === 1) {
    throw new DrillValidationError("The Base64 code is invalid.");
  }
  normalized = normalized.replace(/=+$/u, "");
  normalized += "=".repeat((4 - (normalized.length % 4)) % 4);

  try {
    const binary = atob(normalized);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new DrillValidationError("The Base64 payload could not be decoded as UTF-8.");
  }
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    throw new DrillValidationError("The content is not valid JSON.");
  }
}

function expandCompactSlot(value: unknown, position: number): JsonObject {
  const slot = expandKeys(value, SLOT_KEYS, `Compact slot ${position}`);
  const rle = slot.raw_inputs ?? [];
  if (!Array.isArray(rle)) {
    throw new DrillValidationError(`r in compact slot ${position} must be an array.`);
  }
  slot.raw_inputs = decodeFlatRle(
    rle.map((entry) => {
      if (typeof entry !== "number") {
        throw new DrillValidationError(`r in compact slot ${position} contains an invalid value.`);
      }
      return entry;
    }),
  );
  return slot;
}

function expandReversalList(value: unknown, label: string): ReversalData[] {
  const container = requireRecord(value, `reversal_slots.${label}`);
  const count = container.n === undefined
    ? REVERSAL_SLOT_COUNT
    : Number(container.n);
  if (!Number.isInteger(count) || count < 0 || count > REVERSAL_SLOT_COUNT) {
    throw new DrillValidationError(`n in reversal_slots.${label} must be between 0 and 10.`);
  }
  if (!Array.isArray(container.overrides)) {
    throw new DrillValidationError(`overrides in reversal_slots.${label} must be an array.`);
  }

  const entries = Array.from({ length: count }, () =>
    structuredClone(EMPTY_REVERSAL),
  );
  container.overrides.forEach((override, overrideIndex) => {
    const record = requireRecord(
      override,
        `Override ${overrideIndex + 1} in reversal_slots.${label}`,
    );
    if (!Number.isInteger(record.i) || (record.i as number) < 1 || (record.i as number) > count) {
      throw new DrillValidationError(
        `i in override ${overrideIndex + 1} of reversal_slots.${label} is invalid.`,
      );
    }
    const { i, ...withoutIndex } = record;
    entries[(i as number) - 1] = {
      ...EMPTY_REVERSAL,
      ...expandKeys(withoutIndex, REVERSAL_KEYS, "Reversal override"),
    } as ReversalData;
  });
  return entries;
}

function expandReversalSlots(value: unknown): ReversalSlots {
  const reversal = requireRecord(value, "action_record.reversal_slots");
  return {
    ...structuredClone(reversal),
    down: expandReversalList(reversal.down, "down"),
    guard: expandReversalList(reversal.guard, "guard"),
    damage: expandReversalList(reversal.damage, "damage"),
  } as ReversalSlots;
}

function expandV2(value: unknown): unknown {
  const compact = requireRecord(value, "Payload v2");
  const expanded = structuredClone(compact);

  if (compact.metadata !== undefined) {
    expanded.metadata = expandKeys(compact.metadata, METADATA_KEYS, "metadata");
  }
  if (compact.compatibility !== undefined) {
    expanded.compatibility = expandKeys(
      compact.compatibility,
      COMPATIBILITY_KEYS,
      "compatibility",
    );
  }
  if (compact.training_settings !== undefined) {
    expanded.training_settings = expandKeys(
      compact.training_settings,
      TRAINING_KEYS,
      "training_settings",
    );
  }

  const compactAction = requireRecord(compact.action_record, "action_record");
  const action = structuredClone(compactAction);
  if (compactAction.global_settings !== undefined) {
    action.global_settings = expandKeys(
      compactAction.global_settings,
      GLOBAL_KEYS,
      "global_settings",
    );
  }

  const slotContainer = requireRecord(compactAction.slots ?? { slots: [] }, "action_record.slots");
  if (!Array.isArray(slotContainer.slots)) {
    throw new DrillValidationError("action_record.slots.slots must be an array in v2.");
  }
  action.slots = slotContainer.slots.map(expandCompactSlot);

  if (compactAction.reversal_slots !== undefined) {
    action.reversal_slots = expandReversalSlots(compactAction.reversal_slots);
  }
  expanded.action_record = action;
  return expanded;
}

function compactSlot(slot: RecordingSlot): JsonObject {
  const longSlot = structuredClone(slot) as JsonObject;
  longSlot.frame_count = slot.raw_inputs.length;
  longSlot.raw_inputs = encodeFlatRle(slot.raw_inputs);
  if (isDefaultRecordedGuid(slot.title)) delete longSlot.title;
  return renameKeys(longSlot, SLOT_KEYS);
}

function compactReversalList(entries: readonly ReversalData[]): JsonObject {
  const overrides = entries.flatMap((entry, index) => {
    if (isDefaultReversal(entry)) return [];
    return [{ i: index + 1, ...renameKeys(structuredClone(entry), REVERSAL_KEYS) }];
  });
  const result: JsonObject = { overrides };
  if (entries.length !== REVERSAL_SLOT_COUNT) result.n = entries.length;
  return result;
}

function compactReversalSlots(reversal: ReversalSlots): JsonObject {
  return {
    ...structuredClone(reversal),
    down: compactReversalList(reversal.down),
    guard: compactReversalList(reversal.guard),
    damage: compactReversalList(reversal.damage),
  };
}

function synchronizePlayback(document: DrillDocument): DrillDocument {
  const copy = structuredClone(document);
  const playbackMode = copy.action_record.playback_mode;
  if (
    Number.isInteger(playbackMode) &&
    copy.action_record.global_settings !== undefined
  ) {
    copy.action_record.global_settings.play_type = playbackMode;
  }
  return copy;
}

function compactV2(document: DrillDocument): JsonObject {
  const normalized = synchronizePlayback(normalizeDrill(document));
  const compact = structuredClone(normalized) as JsonObject;
  compact.metadata = renameKeys(normalized.metadata, METADATA_KEYS);
  compact.compatibility = renameKeys(normalized.compatibility, COMPATIBILITY_KEYS);
  if (normalized.training_settings !== undefined) {
    compact.training_settings = renameKeys(normalized.training_settings, TRAINING_KEYS);
  }

  const action = structuredClone(normalized.action_record) as JsonObject;
  if (normalized.action_record.global_settings !== undefined) {
    action.global_settings = renameKeys(
      normalized.action_record.global_settings,
      GLOBAL_KEYS,
    );
  }
  const nonEmptySlots = normalized.action_record.slots
    .filter((slot) => slot.raw_inputs.length > 0)
    .map(compactSlot);
  action.slots = { slots: nonEmptySlots };
  if (normalized.action_record.slots.length !== DRILL_SLOT_COUNT) {
    (action.slots as JsonObject).n = normalized.action_record.slots.length;
  }
  if (normalized.action_record.reversal_slots !== undefined) {
    action.reversal_slots = compactReversalSlots(
      normalized.action_record.reversal_slots,
    );
  }
  compact.action_record = action;
  return compact;
}

export function parseImport(raw: string): ImportResult {
  const value = stripClipboardSuffix(String(raw).replace(/^\uFEFF/u, "").trim());
  if (value === "") {
    throw new DrillValidationError("Paste an SF6DRILL code or JSON document.");
  }

  let sourceFormat: ImportResult["sourceFormat"];
  let parsed: unknown;
  if (value.startsWith(V2_PREFIX)) {
    sourceFormat = "v2";
    parsed = expandV2(parseJson(decodeBase64Utf8(value.slice(V2_PREFIX.length))));
  } else if (value.startsWith(V1_PREFIX)) {
    sourceFormat = "v1";
    parsed = parseJson(decodeBase64Utf8(value.slice(V1_PREFIX.length)));
  } else if (value.startsWith("SF6DRILL:")) {
    throw new DrillValidationError("This SF6DRILL code version is not supported.");
  } else if (value.startsWith("{")) {
    sourceFormat = "json";
    parsed = parseJson(value);
  } else {
    throw new DrillValidationError(
      "Use an SF6DRILL:v1/v2 code or a long-form JSON document starting with `{`.",
    );
  }

  return { document: normalizeDrill(parsed), sourceFormat };
}

export function exportV2(document: DrillDocument): string {
  const json = JSON.stringify(compactV2(document));
  return `${V2_PREFIX}${encodeBase64Utf8(json)}`;
}

export function exportV1(document: DrillDocument): string {
  const json = JSON.stringify(synchronizePlayback(normalizeDrill(document)));
  return `${V1_PREFIX}${encodeBase64Utf8(json)}`;
}

export function exportLongJson(document: DrillDocument): string {
  return JSON.stringify(synchronizePlayback(normalizeDrill(document)), null, 2);
}

export const SF6DRILL_V1_PREFIX = V1_PREFIX;
export const SF6DRILL_V2_PREFIX = V2_PREFIX;

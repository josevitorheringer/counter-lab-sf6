import type { DrillDocument, JsonObject } from "../domain/types";
import {
  EMPTY_REVERSAL,
  RECORDED_SLOT_GUID,
  createEmptySlot,
  normalizeDrill,
} from "../domain/validation";

export const HADOKEN_RAW_INPUTS = [
  ...Array<number>(4).fill(2),
  ...Array<number>(5).fill(10),
  8,
  ...Array<number>(14).fill(72),
];

export const OD_TATSU_RLE = [3, 2, 5, 6, 1, 4, 31, 772, 2, 774];
export const CROUCHING_LIGHT_KICK_RLE = [23, 2, 6, 130, 4, 2];

export function createLongDrillFixture(): DrillDocument {
  const slots = Array.from({ length: 8 }, (_, index) => createEmptySlot(index + 1));
  slots[0] = {
    ...slots[0],
    raw_inputs: [...HADOKEN_RAW_INPUTS],
    frame_count: HADOKEN_RAW_INPUTS.length,
    is_active: true,
    is_valid: true,
    state: 1,
    title: structuredClone(RECORDED_SLOT_GUID),
    custom_slot_field: "preserve",
  };

  const down = Array.from({ length: 10 }, () => structuredClone(EMPTY_REVERSAL));
  down[0] = {
    ...down[0],
    Type: 5,
    SkillIndex: 2,
    IsValid: true,
    IsFrame: true,
  };
  const emptyReversals = () =>
    Array.from({ length: 10 }, () => structuredClone(EMPTY_REVERSAL));

  return normalizeDrill({
    version: 1,
    metadata: {
      id: "5e8b4d82-1234-4567-8901-123456789abc",
      title: "Hadoken — medium pressure",
      author: "José",
      description: "Unicode test: café, naïve, and résumé.",
      created_at: "2026-10-01T20:00:00Z",
      tags: ["hadoken", "community"],
      custom_metadata_field: true,
    },
    compatibility: {
      dummy_character_id: 10,
      dummy_character_name: "Ken",
      player_character_id: 1,
    },
    training_settings: {
      dummy_stance: 0,
      dummy_guard: 0,
      player_drive_gauge: 60000,
      dummy_drive_gauge: 60000,
      player_super_gauge: 30000,
      dummy_super_gauge: 30000,
      stage_position: "Center",
    },
    action_record: {
      playback_mode: 0,
      global_settings: {
        info_type: 0,
        loop_type: 1,
        play_type: 0,
        record_countdown: 0,
        record_start_type: 1,
        record_type: 0,
      },
      slots,
      reversal_slots: {
        down,
        guard: emptyReversals(),
        damage: emptyReversals(),
      },
    },
    custom_root_field: { source: "documented real fixture" },
  });
}

export const COMPACT_V2_FIXTURE: JsonObject = {
  version: 1,
  metadata: {
    i: "5e8b4d82-1234-4567-8901-123456789abc",
    t: "Hadoken — medium pressure",
    a: "José",
    d: "Unicode test: café, naïve, and résumé.",
    c: "2026-10-01T20:00:00Z",
    g: ["hadoken", "community"],
    custom_metadata_field: true,
  },
  compatibility: { d: 10, n: "Ken", p: 1 },
  training_settings: {
    ds: 0,
    dg: 0,
    pg: 60000,
    gg: 60000,
    ps: 30000,
    gs: 30000,
    sp: "Center",
  },
  action_record: {
    playback_mode: 0,
    global_settings: { i: 0, l: 1, p: 0, c: 0, s: 1, t: 0 },
    reversal_slots: {
      down: {
        overrides: [
          {
            i: 1,
            t: 5,
            k: 2,
            v: true,
            a: false,
            g: true,
            f: 0,
            d: 0,
            c: 1,
            l: 0,
          },
        ],
      },
      guard: { overrides: [] },
      damage: { overrides: [] },
    },
    slots: {
      slots: [
        {
          i: 1,
          f: 24,
          a: true,
          v: true,
          w: 1,
          s: 1,
          o: false,
          c: 0,
          e: false,
          r: [4, 2, 5, 10, 1, 8, 14, 72],
          custom_slot_field: "preserve",
        },
      ],
    },
  },
  custom_root_field: { source: "documented real fixture" },
};

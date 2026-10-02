import { describe, expect, it } from "vitest";

import { normalizeDrill } from "./validation";

function minimumDrill(slots: unknown[] = []) {
  return {
    version: 1,
    metadata: { title: "Test" },
    compatibility: { dummy_character_id: 1 },
    action_record: { slots },
  };
}

describe("validation and normalization", () => {
  it("rebuilds eight slots and synchronizes derived fields", () => {
    const document = normalizeDrill(
      minimumDrill([
        {
          slot_index: 1,
          raw_inputs: [2, 130, 2],
          frame_count: 0,
          weight: 0,
          custom: "preserved",
        },
      ]),
    );

    expect(document.action_record.slots).toHaveLength(8);
    expect(document.action_record.slots[0]).toMatchObject({
      frame_count: 3,
      is_valid: true,
      state: 1,
      weight: 0,
      custom: "preserved",
    });
    expect(document.action_record.slots[7]).toMatchObject({
      slot_index: 8,
      raw_inputs: [],
      frame_count: 0,
    });
  });

  it("rejects duplicate indices and masks outside UInt16", () => {
    expect(() =>
      normalizeDrill(
        minimumDrill([
          { slot_index: 1, raw_inputs: [] },
          { slot_index: 1, raw_inputs: [] },
        ]),
      ),
    ).toThrow(/more than once/);
    expect(() =>
      normalizeDrill(
        minimumDrill([{ slot_index: 1, raw_inputs: [65536] }]),
      ),
    ).toThrow(/at most 65535/);
  });

  it("rejects floats in known integer fields", () => {
    expect(() =>
      normalizeDrill({
        ...minimumDrill(),
        training_settings: { drive_reversal_delay: 1.5 },
      }),
    ).toThrow(/integer/);
  });

  it("accepts slot weights from zero to ten and rejects larger values", () => {
    expect(
      normalizeDrill(minimumDrill([{ slot_index: 1, raw_inputs: [], weight: 10 }]))
        .action_record.slots[0].weight,
    ).toBe(10);
    expect(() =>
      normalizeDrill(minimumDrill([{ slot_index: 1, raw_inputs: [], weight: 11 }])),
    ).toThrow(/at most 10/);
  });

  it("applies the minimum validation required by the mod", () => {
    expect(() => normalizeDrill({})).toThrow(/version/);
    expect(() =>
      normalizeDrill({
        version: 1,
        metadata: { title: "" },
        compatibility: { dummy_character_id: 1 },
        action_record: {},
      }),
    ).toThrow(/metadata.title/);
    expect(() =>
      normalizeDrill({
        version: 1,
        metadata: { title: "Test" },
        compatibility: {},
        action_record: {},
      }),
    ).toThrow(/dummy_character_id/);
  });
});

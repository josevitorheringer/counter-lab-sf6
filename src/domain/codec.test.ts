import { describe, expect, it } from "vitest";

import {
  decodeBase64Utf8,
  encodeBase64Utf8,
  exportLongJson,
  exportV1,
  exportV2,
  parseImport,
  SF6DRILL_V2_PREFIX,
} from "./codec";
import { encodeFlatRle } from "./timeline";
import { RECORDED_SLOT_GUID } from "./validation";
import {
  COMPACT_V2_FIXTURE,
  CROUCHING_LIGHT_KICK_RLE,
  HADOKEN_RAW_INPUTS,
  OD_TATSU_RLE,
  createLongDrillFixture,
} from "../test/fixtures";

function compactFixtureCode(): string {
  return `${SF6DRILL_V2_PREFIX}${encodeBase64Utf8(JSON.stringify(COMPACT_V2_FIXTURE))}`;
}

describe("SF6DRILL codec", () => {
  it("imports v2 and expands keys, RLE, slots, GUID, and reversals", () => {
    const result = parseImport(compactFixtureCode());

    expect(result.sourceFormat).toBe("v2");
    expect(result.document.metadata.title).toBe("Hadoken — medium pressure");
    expect(result.document.compatibility.dummy_character_id).toBe(10);
    expect(result.document.action_record.slots).toHaveLength(8);
    expect(result.document.action_record.slots[0].raw_inputs).toEqual(HADOKEN_RAW_INPUTS);
    expect(result.document.action_record.slots[0].title).toEqual(RECORDED_SLOT_GUID);
    expect(result.document.action_record.slots[1].raw_inputs).toEqual([]);
    expect(result.document.action_record.reversal_slots?.down).toHaveLength(10);
    expect(result.document.action_record.reversal_slots?.down[0]).toMatchObject({
      Type: 5,
      SkillIndex: 2,
      IsValid: true,
      IsFrame: true,
    });
  });

  it("preserves unknown fields during a v2 round-trip", () => {
    const first = parseImport(compactFixtureCode()).document;
    const second = parseImport(exportV2(first)).document;

    expect(second).toEqual(first);
    expect(second.custom_root_field).toEqual({ source: "documented real fixture" });
    expect(second.metadata.custom_metadata_field).toBe(true);
    expect(second.action_record.slots[0].custom_slot_field).toBe("preserve");
  });

  it("omits defaults and empty slots from the compact payload", () => {
    const code = exportV2(createLongDrillFixture());
    const payload = JSON.parse(
      decodeBase64Utf8(code.slice(SF6DRILL_V2_PREFIX.length)),
    ) as {
      action_record: {
        slots: { slots: Array<Record<string, unknown>> };
        reversal_slots: { guard: { overrides: unknown[] } };
      };
    };

    expect(payload.action_record.slots.slots).toHaveLength(1);
    expect(payload.action_record.slots.slots[0].t).toBeUndefined();
    expect(payload.action_record.reversal_slots.guard.overrides).toEqual([]);
  });

  it("imports v1 and long-form JSON into the same internal model", () => {
    const fixture = createLongDrillFixture();
    const fromV1 = parseImport(exportV1(fixture));
    const fromJson = parseImport(JSON.stringify(fixture));

    expect(fromV1.sourceFormat).toBe("v1");
    expect(fromJson.sourceFormat).toBe("json");
    expect(fromV1.document).toEqual(fromJson.document);
  });

  it("encodes Unicode as real UTF-8 instead of Unicode escapes", () => {
    const code = exportV2(createLongDrillFixture());
    const decoded = decodeBase64Utf8(code.slice(SF6DRILL_V2_PREFIX.length));

    expect(decoded).toContain("José");
    expect(decoded).toContain("café");
    expect(decoded).not.toContain("\\u00");
  });

  it("tolerates trailing asterisks in pasted codes", () => {
    const result = parseImport(`${compactFixtureCode()}\\*\\*\\*\\*`);
    expect(result.document.metadata.title).toBe("Hadoken — medium pressure");
  });

  it("exports long-form JSON with readable names", () => {
    const exported = exportLongJson(createLongDrillFixture());
    const parsed = JSON.parse(exported) as Record<string, unknown>;

    expect(exported).toContain('"raw_inputs"');
    expect(exported).not.toContain('"r":');
    expect(parsed.version).toBe(1);
  });

  it("represents the documented real examples in RLE", () => {
    expect(encodeFlatRle(HADOKEN_RAW_INPUTS)).toEqual([4, 2, 5, 10, 1, 8, 14, 72]);
    expect(OD_TATSU_RLE).toEqual([3, 2, 5, 6, 1, 4, 31, 772, 2, 774]);
    expect(CROUCHING_LIGHT_KICK_RLE).toEqual([23, 2, 6, 130, 4, 2]);
  });

  it("rejects invalid formats and structures with readable messages", () => {
    expect(() => parseImport("YWJj")).toThrow(/SF6DRILL:v1\/v2/);
    expect(() => parseImport("SF6DRILL:v3:e30=")).toThrow(/not supported/);
    expect(() =>
      parseImport(
        `${SF6DRILL_V2_PREFIX}${encodeBase64Utf8(
          JSON.stringify({
            ...COMPACT_V2_FIXTURE,
            action_record: {
              ...(COMPACT_V2_FIXTURE.action_record as object),
              slots: { slots: [{ i: 1, r: [1] }] },
            },
          }),
        )}`,
      ),
    ).toThrow(/pairs/);
    expect(() =>
      parseImport(JSON.stringify({ version: 1, metadata: { title: "" } })),
    ).toThrow(/metadata.title/);
  });
});

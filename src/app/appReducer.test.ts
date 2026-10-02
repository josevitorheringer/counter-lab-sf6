import { describe, expect, it } from "vitest";

import { createLongDrillFixture } from "../test/fixtures";
import { appReducer, initialAppState } from "./appReducer";

describe("appReducer", () => {
  it("imports and starts with empty history", () => {
    const state = appReducer(initialAppState, {
      type: "IMPORT_DOCUMENT",
      document: createLongDrillFixture(),
    });
    expect(state.document).not.toBeNull();
    expect(state.history).toEqual({ past: [], future: [] });
  });

  it("edits blocks and keeps frame_count synchronized", () => {
    let state = appReducer(initialAppState, {
      type: "IMPORT_DOCUMENT",
      document: createLongDrillFixture(),
    });
    state = appReducer(state, { type: "ADD_BLOCK", block: { frames: 3, mask: 130 } });
    expect(state.document?.action_record.slots[0].frame_count).toBe(27);
    expect(state.history.past).toHaveLength(1);
  });

  it("undoes, redoes, and discards future history after a change", () => {
    let state = appReducer(initialAppState, {
      type: "IMPORT_DOCUMENT",
      document: createLongDrillFixture(),
    });
    state = appReducer(state, { type: "CLEAR_SLOT" });
    expect(state.document?.action_record.slots[0].frame_count).toBe(0);
    state = appReducer(state, { type: "UNDO" });
    expect(state.document?.action_record.slots[0].frame_count).toBe(24);
    state = appReducer(state, { type: "REDO" });
    expect(state.document?.action_record.slots[0].frame_count).toBe(0);
    state = appReducer(state, { type: "UNDO" });
    state = appReducer(state, { type: "ADD_BLOCK", block: { frames: 1, mask: 0 } });
    expect(state.history.future).toHaveLength(0);
  });

  it("copies to a target without changing the eight indices", () => {
    let state = appReducer(initialAppState, {
      type: "IMPORT_DOCUMENT",
      document: createLongDrillFixture(),
    });
    state = appReducer(state, { type: "COPY_SLOT_TO", targetIndex: 4 });
    expect(state.document?.action_record.slots).toHaveLength(8);
    expect(state.document?.action_record.slots.map((slot) => slot.slot_index)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8,
    ]);
    expect(state.document?.action_record.slots[4].raw_inputs).toEqual(
      state.document?.action_record.slots[0].raw_inputs,
    );
  });

  it("does not add preferences to history", () => {
    const state = appReducer(initialAppState, {
      type: "SET_NOTATION_THEME",
      theme: "sf6",
    });
    expect(state.preferences.notationTheme).toBe("sf6");
    expect(state.history.past).toHaveLength(0);
  });

  it("changes language without adding it to history", () => {
    const state = appReducer(initialAppState, {
      type: "SET_LANGUAGE",
      language: "pt-BR",
    });
    expect(state.preferences.language).toBe("pt-BR");
    expect(state.history.past).toHaveLength(0);
  });

  it("updates the dummy character and supports undo", () => {
    let state = appReducer(initialAppState, {
      type: "IMPORT_DOCUMENT",
      document: createLongDrillFixture(),
    });
    state = appReducer(state, {
      type: "UPDATE_DUMMY_CHARACTER",
      character: { id: 22, name: "Akuma" },
    });

    expect(state.document?.compatibility).toMatchObject({
      dummy_character_id: 22,
      dummy_character_name: "Akuma",
    });

    state = appReducer(state, { type: "UNDO" });
    expect(state.document?.compatibility).toMatchObject({
      dummy_character_id: 10,
      dummy_character_name: "Ken",
    });
  });
});

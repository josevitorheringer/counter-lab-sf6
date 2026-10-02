import { INPUT_PRESETS } from "../domain/presets";
import {
  compactBlocks,
  encodeRawInputs,
  setSlotBlocks,
} from "../domain/timeline";
import type { DrillDocument, InputBlock, RecordingSlot } from "../domain/types";
import { createEmptySlot } from "../domain/validation";
import type { AppAction, AppState, EditorSnapshot } from "./appTypes";

const HISTORY_LIMIT = 50;

export const initialAppState: AppState = {
  document: null,
  activeSlotIndex: 0,
  selectedBlockIndex: null,
  history: { past: [], future: [] },
  preferences: {
    notationTheme: "numpad",
    colorMode: "system",
    timelineZoom: 100,
    language: "en",
  },
  importError: null,
};

function snapshot(state: AppState): EditorSnapshot {
  if (!state.document) throw new Error("There is no document to add to history.");
  return {
    document: structuredClone(state.document),
    activeSlotIndex: state.activeSlotIndex,
  };
}

function withDocumentChange(
  state: AppState,
  update: (document: DrillDocument) => DrillDocument,
  selectedBlockIndex: number | null = state.selectedBlockIndex,
): AppState {
  if (!state.document) return state;
  const past = [...state.history.past, snapshot(state)].slice(-HISTORY_LIMIT);
  return {
    ...state,
    document: update(structuredClone(state.document)),
    selectedBlockIndex,
    history: { past, future: [] },
  };
}

function updateActiveSlot(
  document: DrillDocument,
  activeSlotIndex: number,
  update: (slot: RecordingSlot) => RecordingSlot,
): DrillDocument {
  const slots = [...document.action_record.slots];
  const slot = slots[activeSlotIndex];
  if (!slot) return document;
  slots[activeSlotIndex] = update(slot);
  return {
    ...document,
    action_record: { ...document.action_record, slots },
  };
}

function updateBlocks(
  document: DrillDocument,
  activeSlotIndex: number,
  update: (blocks: InputBlock[]) => InputBlock[],
): DrillDocument {
  return updateActiveSlot(document, activeSlotIndex, (slot) =>
    setSlotBlocks(slot, compactBlocks(update(encodeRawInputs(slot.raw_inputs)))),
  );
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "IMPORT_DOCUMENT":
      return {
        ...state,
        document: structuredClone(action.document),
        activeSlotIndex: 0,
        selectedBlockIndex: null,
        history: { past: [], future: [] },
        importError: null,
      };
    case "RESET_DOCUMENT":
      return {
        ...state,
        document: null,
        activeSlotIndex: 0,
        selectedBlockIndex: null,
        history: { past: [], future: [] },
        importError: null,
      };
    case "SET_IMPORT_ERROR":
      return { ...state, importError: action.error };
    case "SELECT_SLOT":
      if (action.index < 0 || action.index >= 8) return state;
      return { ...state, activeSlotIndex: action.index, selectedBlockIndex: null };
    case "SELECT_BLOCK":
      return { ...state, selectedBlockIndex: action.index };
    case "ADD_BLOCK":
      return withDocumentChange(
        state,
        (document) =>
          updateBlocks(document, state.activeSlotIndex, (blocks) => [
            ...blocks,
            action.block,
          ]),
        null,
      );
    case "UPDATE_BLOCK":
      return withDocumentChange(state, (document) =>
        updateBlocks(document, state.activeSlotIndex, (blocks) =>
          blocks.map((block, index) => (index === action.index ? action.block : block)),
        ),
      );
    case "DUPLICATE_BLOCK":
      return withDocumentChange(
        state,
        (document) =>
          updateBlocks(document, state.activeSlotIndex, (blocks) => {
            const block = blocks[action.index];
            if (!block) return blocks;
            const next = [...blocks];
            next.splice(action.index + 1, 0, { ...block });
            return next;
          }),
        action.index + 1,
      );
    case "DELETE_BLOCK":
      return withDocumentChange(
        state,
        (document) =>
          updateBlocks(document, state.activeSlotIndex, (blocks) =>
            blocks.filter((_, index) => index !== action.index),
          ),
        null,
      );
    case "MOVE_BLOCK":
      return withDocumentChange(
        state,
        (document) =>
          updateBlocks(document, state.activeSlotIndex, (blocks) => {
            const target = action.index + action.direction;
            if (!blocks[action.index] || target < 0 || target >= blocks.length) return blocks;
            const next = [...blocks];
            [next[action.index], next[target]] = [next[target], next[action.index]];
            return next;
          }),
        action.index + action.direction,
      );
    case "ADD_PRESET":
      return withDocumentChange(
        state,
        (document) =>
          updateBlocks(document, state.activeSlotIndex, (blocks) => [
            ...blocks,
            ...INPUT_PRESETS[action.presetId].blocks.map((block) => ({ ...block })),
          ]),
        null,
      );
    case "COPY_SLOT_TO":
      if (action.targetIndex < 0 || action.targetIndex >= 8) return state;
      return withDocumentChange(state, (document) => {
        const source = document.action_record.slots[state.activeSlotIndex];
        if (!source) return document;
        const slots = [...document.action_record.slots];
        slots[action.targetIndex] = {
          ...structuredClone(source),
          slot_index: action.targetIndex + 1,
        };
        return { ...document, action_record: { ...document.action_record, slots } };
      });
    case "CLEAR_SLOT":
      return withDocumentChange(
        state,
        (document) =>
          updateActiveSlot(document, state.activeSlotIndex, () =>
            createEmptySlot(state.activeSlotIndex + 1),
          ),
        null,
      );
    case "UPDATE_METADATA":
      return withDocumentChange(state, (document) => ({
        ...document,
        metadata: { ...document.metadata, ...action.changes },
      }));
    case "UPDATE_DUMMY_CHARACTER":
      return withDocumentChange(state, (document) => ({
        ...document,
        compatibility: {
          ...document.compatibility,
          dummy_character_id: action.character.id,
          dummy_character_name: action.character.name,
        },
      }));
    case "UNDO": {
      const previous = state.history.past.at(-1);
      if (!previous || !state.document) return state;
      return {
        ...state,
        document: structuredClone(previous.document),
        activeSlotIndex: previous.activeSlotIndex,
        selectedBlockIndex: null,
        history: {
          past: state.history.past.slice(0, -1),
          future: [snapshot(state), ...state.history.future].slice(0, HISTORY_LIMIT),
        },
      };
    }
    case "REDO": {
      const next = state.history.future[0];
      if (!next || !state.document) return state;
      return {
        ...state,
        document: structuredClone(next.document),
        activeSlotIndex: next.activeSlotIndex,
        selectedBlockIndex: null,
        history: {
          past: [...state.history.past, snapshot(state)].slice(-HISTORY_LIMIT),
          future: state.history.future.slice(1),
        },
      };
    }
    case "SET_NOTATION_THEME":
      return {
        ...state,
        preferences: { ...state.preferences, notationTheme: action.theme },
      };
    case "SET_COLOR_MODE":
      return {
        ...state,
        preferences: { ...state.preferences, colorMode: action.mode },
      };
    case "SET_TIMELINE_ZOOM":
      return {
        ...state,
        preferences: {
          ...state.preferences,
          timelineZoom: Math.max(50, Math.min(180, action.zoom)),
        },
      };
    case "SET_LANGUAGE":
      return {
        ...state,
        preferences: { ...state.preferences, language: action.language },
      };
  }
}

import type { DrillDocument, InputBlock } from "../domain/types";
import type { AttackButton, NumpadDirection } from "../domain/masks";
import type { InputPresetId } from "../domain/presets";

export type NotationThemeId = "numpad" | "sf6";
export type ColorMode = "system" | "light" | "dark";
export type Language = "en" | "pt-BR";

export type InputDraft = {
  direction: NumpadDirection;
  buttons: AttackButton[];
  frames: number;
  preservedBits: number;
};

export type EditorSnapshot = {
  document: DrillDocument;
  activeSlotIndex: number;
};

export type AppPreferences = {
  notationTheme: NotationThemeId;
  colorMode: ColorMode;
  timelineZoom: number;
  language: Language;
};

export type AppState = {
  document: DrillDocument | null;
  activeSlotIndex: number;
  selectedBlockIndex: number | null;
  history: {
    past: EditorSnapshot[];
    future: EditorSnapshot[];
  };
  preferences: AppPreferences;
  importError: string | null;
};

export type AppAction =
  | { type: "IMPORT_DOCUMENT"; document: DrillDocument }
  | { type: "RESET_DOCUMENT" }
  | { type: "SET_IMPORT_ERROR"; error: string | null }
  | { type: "SELECT_SLOT"; index: number }
  | { type: "SELECT_BLOCK"; index: number | null }
  | { type: "ADD_BLOCK"; block: InputBlock }
  | { type: "UPDATE_BLOCK"; index: number; block: InputBlock }
  | { type: "DUPLICATE_BLOCK"; index: number }
  | { type: "DELETE_BLOCK"; index: number }
  | { type: "MOVE_BLOCK"; index: number; direction: -1 | 1 }
  | { type: "ADD_PRESET"; presetId: InputPresetId }
  | { type: "COPY_SLOT_TO"; targetIndex: number }
  | { type: "CLEAR_SLOT" }
  | {
      type: "UPDATE_METADATA";
      changes: Partial<Pick<DrillDocument["metadata"], "title" | "author" | "description">>;
    }
  | {
      type: "UPDATE_DUMMY_CHARACTER";
      character: { id: number; name: string };
    }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET_NOTATION_THEME"; theme: NotationThemeId }
  | { type: "SET_COLOR_MODE"; mode: ColorMode }
  | { type: "SET_TIMELINE_ZOOM"; zoom: number }
  | { type: "SET_LANGUAGE"; language: Language };

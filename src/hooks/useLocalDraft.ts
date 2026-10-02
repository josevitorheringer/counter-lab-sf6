import { type Dispatch, useEffect, useRef, useState } from "react";

import type { DrillDocument } from "../domain/types";
import { normalizeDrill } from "../domain/validation";
import type { AppAction, AppPreferences, AppState } from "../app/appTypes";

const DRAFT_KEY = "counter-lab:draft:v1";
const PREFERENCES_KEY = "counter-lab:preferences:v1";

type StoredDraft = {
  document: DrillDocument;
  activeSlotIndex: number;
  updatedAt: string;
};

export function readLocalDraft(): StoredDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDraft>;
    if (!parsed.document) return null;
    return {
      document: normalizeDrill(parsed.document),
      activeSlotIndex:
        Number.isInteger(parsed.activeSlotIndex) &&
        (parsed.activeSlotIndex as number) >= 0 &&
        (parsed.activeSlotIndex as number) < 8
          ? (parsed.activeSlotIndex as number)
          : 0,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // localStorage may be unavailable.
    }
    return null;
  }
}

export function hasLocalDraft(): boolean {
  return readLocalDraft() !== null;
}

export function useLocalDraft(state: AppState, dispatch: Dispatch<AppAction>) {
  const loadedPreferences = useRef(false);
  const [preferencesReady, setPreferencesReady] = useState(false);

  useEffect(() => {
    if (loadedPreferences.current) return;
    loadedPreferences.current = true;
    try {
      const raw = localStorage.getItem(PREFERENCES_KEY);
      if (raw) {
        const preferences = JSON.parse(raw) as Partial<AppPreferences>;
        if (preferences.notationTheme === "numpad" || preferences.notationTheme === "sf6") {
          dispatch({ type: "SET_NOTATION_THEME", theme: preferences.notationTheme });
        }
        if (
          preferences.colorMode === "system" ||
          preferences.colorMode === "light" ||
          preferences.colorMode === "dark"
        ) {
          dispatch({ type: "SET_COLOR_MODE", mode: preferences.colorMode });
        }
        if (Number.isFinite(preferences.timelineZoom)) {
          dispatch({ type: "SET_TIMELINE_ZOOM", zoom: Number(preferences.timelineZoom) });
        }
        if (preferences.language === "en" || preferences.language === "pt-BR") {
          dispatch({ type: "SET_LANGUAGE", language: preferences.language });
        }
      }
    } catch {
      try {
        localStorage.removeItem(PREFERENCES_KEY);
      } catch {
        // localStorage may be unavailable.
      }
    } finally {
      setPreferencesReady(true);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!preferencesReady) return;
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(state.preferences));
    } catch {
      // Persistence is optional.
    }
  }, [preferencesReady, state.preferences]);

  useEffect(() => {
    if (!state.document) return;
    const timer = window.setTimeout(() => {
      try {
        const draft: StoredDraft = {
          document: state.document as DrillDocument,
          activeSlotIndex: state.activeSlotIndex,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch {
        // Persistence is optional.
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [state.document, state.activeSlotIndex]);
}

import { type Dispatch, useEffect } from "react";

import type { AppAction, AppState } from "../app/appTypes";

export function useKeyboardShortcuts(state: AppState, dispatch: Dispatch<AppAction>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editingText =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;
      const modifier = event.metaKey || event.ctrlKey;

      if (modifier && event.key.toLowerCase() === "z") {
        event.preventDefault();
        dispatch({ type: event.shiftKey ? "REDO" : "UNDO" });
      } else if (
        !editingText &&
        (event.key === "Delete" || event.key === "Backspace") &&
        state.selectedBlockIndex !== null
      ) {
        event.preventDefault();
        dispatch({ type: "DELETE_BLOCK", index: state.selectedBlockIndex });
      } else if (event.key === "Escape") {
        dispatch({ type: "SELECT_BLOCK", index: null });
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, state.selectedBlockIndex]);
}

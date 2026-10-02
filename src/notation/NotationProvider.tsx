import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
} from "react";

import type { AttackButton, NumpadDirection } from "../domain/masks";
import { describeMask } from "../domain/masks";
import type { NotationThemeId } from "../app/appTypes";
import { numpadNotation } from "./numpadNotation";
import { sf6Notation } from "./sf6Notation";
import type { NotationSize, NotationTheme } from "./notationTypes";
import { localizedInputLabel, useTranslation } from "../i18n/useTranslation";

const THEMES: Record<NotationThemeId, NotationTheme> = {
  numpad: numpadNotation,
  sf6: sf6Notation,
};

const NotationContext = createContext<NotationTheme>(numpadNotation);

export function NotationProvider({
  themeId,
  children,
}: PropsWithChildren<{ themeId: NotationThemeId }>) {
  const theme = useMemo(() => THEMES[themeId], [themeId]);
  return <NotationContext.Provider value={theme}>{children}</NotationContext.Provider>;
}

export function useNotationTheme(): NotationTheme {
  return useContext(NotationContext);
}

export function InputNotation({ mask, size = "sm" }: { mask: number; size?: NotationSize }) {
  const theme = useNotationTheme();
  const { language } = useTranslation();
  const input = describeMask(mask);
  return (
    <span aria-label={localizedInputLabel(input, language)} className="input-notation">
      {theme.renderInput(input, size)}
    </span>
  );
}

export function DirectionNotation({
  direction,
  size = "md",
}: {
  direction: NumpadDirection;
  size?: NotationSize;
}) {
  const theme = useNotationTheme();
  return <>{theme.renderDirection(direction, size)}</>;
}

export function AttackNotation({
  button,
  size = "md",
}: {
  button: AttackButton;
  size?: NotationSize;
}) {
  const theme = useNotationTheme();
  return <>{theme.renderButton(button, size)}</>;
}

import type { ReactNode } from "react";

import type {
  AttackButton,
  InputMaskDescription,
  NumpadDirection,
} from "../domain/masks";
import type { NotationThemeId } from "../app/appTypes";

export type NotationSize = "sm" | "md";

export type NotationTheme = {
  id: NotationThemeId;
  label: string;
  renderDirection(direction: NumpadDirection, size: NotationSize): ReactNode;
  renderButton(button: AttackButton, size: NotationSize): ReactNode;
  renderInput(input: InputMaskDescription, size: NotationSize): ReactNode;
};

import type { AttackButton, NumpadDirection } from "../domain/masks";
import { FistIcon } from "./icons/FistIcon";
import { KickIcon } from "./icons/KickIcon";
import type { NotationSize, NotationTheme } from "./notationTypes";

const DIRECTION_SYMBOL: Record<NumpadDirection, string> = {
  1: "↙",
  2: "↓",
  3: "↘",
  4: "←",
  5: "●",
  6: "→",
  7: "↖",
  8: "↑",
  9: "↗",
};

function ButtonIcon({ button }: { button: AttackButton }) {
  const Icon = button.endsWith("P") ? FistIcon : KickIcon;
  return <Icon className="attack-icon" />;
}

function strengthClass(button: AttackButton): string {
  if (button.startsWith("L")) return "strength-light";
  if (button.startsWith("M")) return "strength-medium";
  return "strength-heavy";
}

function renderAttack(button: AttackButton, size: NotationSize) {
  return (
    <span className={`sf6-attack ${strengthClass(button)} notation-${size}`}>
      <ButtonIcon button={button} />
      <span>{button[0]}</span>
    </span>
  );
}

export const sf6Notation: NotationTheme = {
  id: "sf6",
  label: "SF6 visual",
  renderDirection(direction, size) {
    return (
      <span className={`sf6-direction notation-${size}`}>
        {DIRECTION_SYMBOL[direction]}
      </span>
    );
  },
  renderButton(button, size) {
    return renderAttack(button, size);
  },
  renderInput(input, size) {
    return (
      <span className={`notation-input notation-sf6 notation-${size}`}>
        <span className="sf6-direction">
          {input.direction ? DIRECTION_SYMBOL[input.direction] : "?"}
        </span>
        {input.buttons.map((button) => (
          <span key={button}>{renderAttack(button, size)}</span>
        ))}
        {input.preservedBits !== 0 && <span>+{input.preservedBits}</span>}
      </span>
    );
  },
};

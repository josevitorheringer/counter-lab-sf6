import type { AttackButton } from "../domain/masks";
import type { NotationTheme } from "./notationTypes";

export const numpadNotation: NotationTheme = {
  id: "numpad",
  label: "Numeric",
  renderDirection(direction, size) {
    return <span className={`notation-direction notation-${size}`}>{direction}</span>;
  },
  renderButton(button, size) {
    return <span className={`notation-text-button notation-${size}`}>{button}</span>;
  },
  renderInput(input, size) {
    const direction = input.direction ?? `D${input.mask & 15}`;
    return (
      <span className={`notation-input notation-numpad notation-${size}`}>
        <span>{direction}</span>
        {input.buttons.map((button: AttackButton) => (
          <span key={button}>{button}</span>
        ))}
        {input.preservedBits !== 0 && <span>+{input.preservedBits}</span>}
      </span>
    );
  },
};

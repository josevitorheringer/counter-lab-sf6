import { ATTACK_BUTTONS, type AttackButton } from "../../domain/masks";
import { AttackNotation } from "../../notation/NotationProvider";
import { useTranslation } from "../../i18n/useTranslation";

export function AttackPicker({
  value,
  onChange,
}: {
  value: AttackButton[];
  onChange: (value: AttackButton[]) => void;
}) {
  const { t } = useTranslation();
  const toggle = (button: AttackButton) => {
    onChange(value.includes(button) ? value.filter((item) => item !== button) : [...value, button]);
  };
  return (
    <fieldset className="editor-fieldset">
      <legend>{t("Buttons")}</legend>
      <div className="attack-grid">
        {ATTACK_BUTTONS.map((button) => (
          <button
            key={button}
            type="button"
            className={value.includes(button) ? "is-active" : ""}
            aria-label={button}
            aria-pressed={value.includes(button)}
            onClick={() => toggle(button)}
          >
            <AttackNotation button={button} />
          </button>
        ))}
      </div>
    </fieldset>
  );
}

import type { NumpadDirection } from "../../domain/masks";
import { DirectionNotation } from "../../notation/NotationProvider";
import { useTranslation } from "../../i18n/useTranslation";

const DIRECTIONS: NumpadDirection[] = [7, 8, 9, 4, 5, 6, 1, 2, 3];

export function DirectionPicker({
  value,
  onChange,
}: {
  value: NumpadDirection;
  onChange: (value: NumpadDirection) => void;
}) {
  const { t } = useTranslation();
  return (
    <fieldset className="editor-fieldset">
      <legend>{t("Direction")}</legend>
      <div className="direction-grid">
        {DIRECTIONS.map((direction) => (
          <button
            key={direction}
            type="button"
            className={value === direction ? "is-active" : ""}
            aria-label={t("Direction {number}", { number: direction })}
            aria-pressed={value === direction}
            onClick={() => onChange(direction)}
          >
            <DirectionNotation direction={direction} />
          </button>
        ))}
      </div>
    </fieldset>
  );
}

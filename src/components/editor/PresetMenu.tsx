import { useApp } from "../../app/AppProvider";
import { INPUT_PRESETS, type InputPresetId } from "../../domain/presets";
import { useTranslation } from "../../i18n/useTranslation";

export function PresetMenu() {
  const { dispatch } = useApp();
  const { t } = useTranslation();
  return (
    <div className="preset-list" aria-label={t("Presets")}>
      {(Object.keys(INPUT_PRESETS) as InputPresetId[]).map((id) => (
        <button key={id} type="button" className="button-quiet" onClick={() => dispatch({ type: "ADD_PRESET", presetId: id })}>
          {t(INPUT_PRESETS[id].label)}
        </button>
      ))}
    </div>
  );
}

import { useTranslation } from "../../i18n/useTranslation";

export function FrameInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const { t } = useTranslation();
  const set = (next: number) => onChange(Math.max(1, Math.min(9999, Math.round(next || 1))));
  return (
    <label className="frame-field">
      <span>{t("Duration in frames")}</span>
      <div className="stepper">
        <button type="button" aria-label={t("Decrease by one frame")} onClick={() => set(value - 1)}>−</button>
        <input type="number" min="1" max="9999" value={value} onChange={(event) => set(Number(event.target.value))} />
        <button type="button" aria-label={t("Increase by one frame")} onClick={() => set(value + 1)}>+</button>
      </div>
    </label>
  );
}

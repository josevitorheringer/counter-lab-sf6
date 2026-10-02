import type { RecordingSlot } from "../../domain/types";
import { useTranslation } from "../../i18n/useTranslation";

export function SlotListItem({
  slot,
  active,
  onSelect,
  onWeightChange,
}: {
  slot: RecordingSlot;
  active: boolean;
  onSelect: () => void;
  onWeightChange: (weight: number) => void;
}) {
  const { t } = useTranslation();
  const setWeight = (value: number) =>
    onWeightChange(Math.max(0, Math.min(10, Math.round(value || 0))));

  return (
    <div className={`slot-item${active ? " is-active" : ""}`}>
      <button
        type="button"
        className="slot-select"
        aria-current={active ? "true" : undefined}
        onClick={onSelect}
      >
        <span className="slot-number">{String(slot.slot_index).padStart(2, "0")}</span>
        <span className="slot-summary">
          <strong>Slot {slot.slot_index}</strong>
          <small>{slot.frame_count}f · {(slot.frame_count / 60).toFixed(2)}s</small>
        </span>
        <span className={`status-dot${slot.is_valid ? " is-valid" : ""}`} aria-label={slot.is_valid ? t("Recorded") : t("Empty")} />
      </button>
      <label className="slot-weight">
        <span>{t("Weight")}</span>
        <input
          type="number"
          min="0"
          max="10"
          step="1"
          value={slot.weight}
          aria-label={t("Weight for Slot {number}", { number: slot.slot_index })}
          onChange={(event) => setWeight(Number(event.target.value))}
        />
      </label>
    </div>
  );
}

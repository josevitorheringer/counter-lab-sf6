import type { RecordingSlot } from "../../domain/types";
import { useTranslation } from "../../i18n/useTranslation";

export function SlotListItem({
  slot,
  active,
  onSelect,
}: {
  slot: RecordingSlot;
  active: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={`slot-item${active ? " is-active" : ""}`}
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
  );
}

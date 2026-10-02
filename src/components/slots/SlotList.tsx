import { useState } from "react";

import { useApp } from "../../app/AppProvider";
import { SlotListItem } from "./SlotListItem";
import { useTranslation } from "../../i18n/useTranslation";

export function SlotList() {
  const { state, dispatch } = useApp();
  const { t } = useTranslation();
  const [target, setTarget] = useState(1);
  if (!state.document) return null;

  return (
    <aside className="slots-panel" aria-label={t("Recording slots")}>
      <div className="panel-heading">
        <h2>{t("Slots")}</h2>
        <span>8</span>
      </div>
      <div className="slot-list">
        {state.document.action_record.slots.map((slot, index) => (
          <SlotListItem
            key={slot.slot_index}
            slot={slot}
            active={state.activeSlotIndex === index}
            onSelect={() => dispatch({ type: "SELECT_SLOT", index })}
          />
        ))}
      </div>
      <div className="slot-actions">
        <label htmlFor="copy-target">{t("Copy to")}</label>
        <div className="inline-controls">
          <select id="copy-target" value={target} onChange={(event) => setTarget(Number(event.target.value))}>
            {state.document.action_record.slots.map((slot, index) => (
              <option key={slot.slot_index} value={index} disabled={index === state.activeSlotIndex}>
                Slot {slot.slot_index}
              </option>
            ))}
          </select>
          <button type="button" className="button-secondary" onClick={() => dispatch({ type: "COPY_SLOT_TO", targetIndex: target })} disabled={target === state.activeSlotIndex}>
            {t("Copy")}
          </button>
        </div>
        <button
          type="button"
          className="button-danger-quiet"
          onClick={() => {
            if (window.confirm(t("Clear every input from this slot?"))) dispatch({ type: "CLEAR_SLOT" });
          }}
        >
          {t("Clear slot")}
        </button>
      </div>
    </aside>
  );
}

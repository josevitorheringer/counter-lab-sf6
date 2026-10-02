import { useApp } from "../../app/AppProvider";
import { encodeRawInputs } from "../../domain/timeline";
import { TimelineBlock } from "./TimelineBlock";
import { TimelineToolbar } from "./TimelineToolbar";
import { useTranslation } from "../../i18n/useTranslation";

export function Timeline() {
  const { state, dispatch } = useApp();
  const { t } = useTranslation();
  const slot = state.document?.action_record.slots[state.activeSlotIndex];
  if (!slot) return null;
  const blocks = encodeRawInputs(slot.raw_inputs);

  return (
    <section className="timeline-section" aria-labelledby="timeline-title">
      <div className="timeline-heading">
        <div>
          <span className="eyebrow">Slot {slot.slot_index}</span>
          <h1 id="timeline-title">{t("Input sequence")}</h1>
        </div>
        <dl className="timeline-stats">
          <div><dt>{t("Frames")}</dt><dd>{slot.frame_count}</dd></div>
          <div><dt>{t("Time")}</dt><dd>{(slot.frame_count / 60).toFixed(2)}s</dd></div>
          <div><dt>{t("Blocks")}</dt><dd>{blocks.length}</dd></div>
        </dl>
      </div>
      <TimelineToolbar />
      <div
        className="timeline-viewport"
        tabIndex={0}
        aria-label={t("Input timeline")}
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          const direction = event.key === "ArrowLeft" ? -1 : 1;
          const current = state.selectedBlockIndex ?? (direction > 0 ? -1 : blocks.length);
          const next = Math.max(0, Math.min(blocks.length - 1, current + direction));
          if (blocks[next]) dispatch({ type: "SELECT_BLOCK", index: next });
        }}
      >
        {blocks.length === 0 ? (
          <p className="empty-state">{t("This slot is empty.")}</p>
        ) : (
          <div className="timeline-track">
            {blocks.map((block, index) => (
              <TimelineBlock
                key={`${index}-${block.mask}`}
                block={block}
                index={index}
                selected={state.selectedBlockIndex === index}
                zoom={state.preferences.timelineZoom}
                onSelect={() => dispatch({ type: "SELECT_BLOCK", index })}
                onMove={(direction) => dispatch({ type: "MOVE_BLOCK", index, direction })}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

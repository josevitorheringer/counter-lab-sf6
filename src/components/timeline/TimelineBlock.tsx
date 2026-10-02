import { InputNotation } from "../../notation/NotationProvider";
import type { InputBlock } from "../../domain/types";
import { describeMask } from "../../domain/masks";
import { useTranslation } from "../../i18n/useTranslation";

export function TimelineBlock({
  block,
  index,
  selected,
  zoom,
  onSelect,
  onMove,
}: {
  block: InputBlock;
  index: number;
  selected: boolean;
  zoom: number;
  onSelect: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  const { t } = useTranslation();
  const input = describeMask(block.mask);
  const durationWidth = block.frames * (zoom / 45);
  const notationWidth = 48 + input.buttons.length * 29 + (input.preservedBits ? 44 : 0);

  return (
    <div
      className={`timeline-block${selected ? " is-selected" : ""}${block.mask === 0 ? " is-neutral" : ""}`}
      style={{ width: `${Math.max(68, durationWidth, notationWidth)}px` }}
    >
      <button
        type="button"
        className="timeline-block-main"
        aria-pressed={selected}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.altKey && event.key === "ArrowLeft") onMove(-1);
          if (event.altKey && event.key === "ArrowRight") onMove(1);
        }}
      >
        <small>{String(index + 1).padStart(2, "0")}</small>
        <InputNotation mask={block.mask} />
        <strong>{block.frames}f</strong>
      </button>
      {selected && (
        <div className="block-move-controls">
          <button type="button" aria-label={t("Move block left")} onClick={() => onMove(-1)}>←</button>
          <button type="button" aria-label={t("Move block right")} onClick={() => onMove(1)}>→</button>
        </div>
      )}
    </div>
  );
}

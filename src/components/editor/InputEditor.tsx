import { useEffect, useState } from "react";

import { useApp } from "../../app/AppProvider";
import { composeMask, describeMask, type AttackButton, type NumpadDirection } from "../../domain/masks";
import { encodeRawInputs } from "../../domain/timeline";
import { InputNotation } from "../../notation/NotationProvider";
import { AttackPicker } from "./AttackPicker";
import { DirectionPicker } from "./DirectionPicker";
import { FrameInput } from "./FrameInput";
import { PresetMenu } from "./PresetMenu";
import { useTranslation } from "../../i18n/useTranslation";

type Draft = {
  direction: NumpadDirection;
  buttons: AttackButton[];
  frames: number;
  preservedBits: number;
};

const EMPTY_DRAFT: Draft = { direction: 5, buttons: [], frames: 1, preservedBits: 0 };

export function InputEditor() {
  const { state, dispatch } = useApp();
  const { t } = useTranslation();
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const slot = state.document?.action_record.slots[state.activeSlotIndex];
  const blocks = slot ? encodeRawInputs(slot.raw_inputs) : [];
  const selected = state.selectedBlockIndex === null ? null : blocks[state.selectedBlockIndex];

  useEffect(() => {
    if (!selected) {
      setDraft(EMPTY_DRAFT);
      return;
    }
    const description = describeMask(selected.mask);
    setDraft({
      direction: description.direction ?? 5,
      buttons: description.buttons,
      frames: selected.frames,
      preservedBits: description.preservedBits,
    });
  }, [selected?.mask, selected?.frames, state.selectedBlockIndex, state.activeSlotIndex]);

  if (!slot) return null;
  const mask = composeMask(draft.direction, draft.buttons, draft.preservedBits);
  const commit = () => {
    const block = { frames: draft.frames, mask };
    if (state.selectedBlockIndex === null) dispatch({ type: "ADD_BLOCK", block });
    else dispatch({ type: "UPDATE_BLOCK", index: state.selectedBlockIndex, block });
  };

  return (
    <section className="input-editor" aria-labelledby="input-editor-title">
      <div className="editor-heading">
        <div>
          <span className="eyebrow">{selected ? t("Block {number}", { number: state.selectedBlockIndex! + 1 }) : t("New block")}</span>
          <h2 id="input-editor-title">{t("Input")}</h2>
        </div>
        <div className="input-preview"><InputNotation mask={mask} size="md" /><small>{t("mask")} {mask}</small></div>
      </div>
      <div className="editor-controls">
        <DirectionPicker value={draft.direction} onChange={(direction) => setDraft((current) => ({ ...current, direction }))} />
        <AttackPicker value={draft.buttons} onChange={(buttons) => setDraft((current) => ({ ...current, buttons }))} />
        <FrameInput value={draft.frames} onChange={(frames) => setDraft((current) => ({ ...current, frames }))} />
      </div>
      <div className="editor-actions">
        <button type="button" className="button-primary" onClick={commit}>
          {selected ? t("Save block") : t("Add block")}
        </button>
        {selected && (
          <>
            <button type="button" className="button-secondary" onClick={() => dispatch({ type: "DUPLICATE_BLOCK", index: state.selectedBlockIndex! })}>{t("Duplicate")}</button>
            <button type="button" className="button-danger-quiet" onClick={() => dispatch({ type: "DELETE_BLOCK", index: state.selectedBlockIndex! })}>{t("Delete")}</button>
            <button type="button" className="button-quiet" onClick={() => dispatch({ type: "SELECT_BLOCK", index: null })}>{t("Cancel")}</button>
          </>
        )}
      </div>
      <div className="preset-section">
        <span>{t("Add sequence")}</span>
        <PresetMenu />
      </div>
    </section>
  );
}

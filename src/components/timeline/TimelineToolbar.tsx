import { useApp } from "../../app/AppProvider";
import { useTranslation } from "../../i18n/useTranslation";

export function TimelineToolbar() {
  const { state, dispatch } = useApp();
  const { t } = useTranslation();
  return (
    <div className="timeline-toolbar">
      <div className="button-group" aria-label={t("History")}>
        <button type="button" className="button-quiet" disabled={state.history.past.length === 0} onClick={() => dispatch({ type: "UNDO" })}>
          {t("Undo")}
        </button>
        <button type="button" className="button-quiet" disabled={state.history.future.length === 0} onClick={() => dispatch({ type: "REDO" })}>
          {t("Redo")}
        </button>
      </div>
      <label className="zoom-control">
        <span>{t("Zoom")}</span>
        <input
          type="range"
          min="50"
          max="180"
          value={state.preferences.timelineZoom}
          onChange={(event) => dispatch({ type: "SET_TIMELINE_ZOOM", zoom: Number(event.target.value) })}
        />
      </label>
    </div>
  );
}

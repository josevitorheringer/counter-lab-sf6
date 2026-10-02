import { useState } from "react";

import { useApp } from "../../app/AppProvider";
import { parseImport } from "../../domain/codec";
import { createDemoDrill } from "../../domain/demo";
import { hasLocalDraft, readLocalDraft } from "../../hooks/useLocalDraft";
import { FileDropZone } from "./FileDropZone";
import { localizeError, useTranslation } from "../../i18n/useTranslation";

export function ImportPanel({
  variant = "page",
  onImported,
}: {
  variant?: "page" | "dialog";
  onImported?: () => void;
}) {
  const { state, dispatch } = useApp();
  const { language, t } = useTranslation();
  const [value, setValue] = useState("");
  const [draftAvailable] = useState(hasLocalDraft);

  const importValue = (text = value) => {
    try {
      const { document } = parseImport(text);
      dispatch({ type: "IMPORT_DOCUMENT", document });
      onImported?.();
    } catch (error) {
      dispatch({
        type: "SET_IMPORT_ERROR",
        error: error instanceof Error ? error.message : "The drill could not be imported.",
      });
    }
  };
  const resume = () => {
    const draft = readLocalDraft();
    if (!draft) return;
    dispatch({ type: "IMPORT_DOCUMENT", document: draft.document });
    dispatch({ type: "SELECT_SLOT", index: draft.activeSlotIndex });
    onImported?.();
  };

  const inputId = variant === "dialog" ? "replace-drill-code" : "import-code";
  const content = (
    <>
      {variant === "page" && <h1 id="import-title">{t("Import drill")}</h1>}
      {variant === "dialog" && (
        <p className="replacement-note">
          {t("Your current drill will only be replaced after the new drill is validated.")}
        </p>
      )}
      <label htmlFor={inputId}>{t("SF6DRILL code or JSON")}</label>
      <textarea
        id={inputId}
        rows={8}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") importValue();
        }}
        placeholder="SF6DRILL:v2:..."
      />
      {state.importError && <p className="form-error" role="alert">{localizeError(state.importError, language)}</p>}
      <div className="button-row">
        <button type="button" className="button-primary" onClick={() => importValue()}>
          {variant === "dialog" ? t("Replace drill") : t("Import")}
        </button>
        {variant === "page" && (
          <button type="button" className="button-secondary" onClick={() => dispatch({ type: "IMPORT_DOCUMENT", document: createDemoDrill(language) })}>
            {t("Load example")}
          </button>
        )}
        {variant === "page" && draftAvailable && (
          <button type="button" className="button-quiet" onClick={resume}>
            {t("Resume draft")}
          </button>
        )}
      </div>
      <FileDropZone onText={(text) => { setValue(text); importValue(text); }} />
      <p className="local-note">{t("Processing happens in this browser.")}</p>
    </>
  );

  if (variant === "dialog") {
    return <div className="import-panel import-panel-dialog">{content}</div>;
  }

  return (
    <main className="import-page" aria-labelledby="import-title">
      <section className="import-panel">{content}</section>
    </main>
  );
}

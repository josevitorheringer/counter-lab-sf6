import { useEffect, useRef } from "react";

import { useApp } from "../../app/AppProvider";
import { ImportPanel } from "./ImportPanel";
import { useTranslation } from "../../i18n/useTranslation";

export function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useApp();
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    dispatch({ type: "SET_IMPORT_ERROR", error: null });
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'button, textarea, input, select, [href], [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", trapFocus);
    return () => {
      document.removeEventListener("keydown", trapFocus);
      previousFocus?.focus();
    };
  }, [dispatch, open]);

  if (!open) return null;

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        ref={dialogRef}
        className="import-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="replace-drill-title"
      >
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">{t("Current drill remains open")}</span>
            <h2 id="replace-drill-title">{t("Import another drill")}</h2>
          </div>
          <button type="button" className="icon-button" aria-label={t("Cancel import")} onClick={onClose}>×</button>
        </div>
        <ImportPanel variant="dialog" onImported={onClose} />
      </section>
    </div>
  );
}

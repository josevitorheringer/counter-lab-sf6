import { useEffect, useRef } from "react";

import { useTranslation } from "../../i18n/useTranslation";

export function DrillcodesSendDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef(true);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = true;
    const previousFocus = document.activeElement as HTMLElement | null;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])',
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
      if (restoreFocusRef.current) previousFocus?.focus();
    };
  }, [open]);

  if (!open) return null;

  const confirm = () => {
    restoreFocusRef.current = false;
    onConfirm();
  };

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        ref={dialogRef}
        className="integration-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drillcodes-send-title"
      >
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">drillcodes</span>
            <h2 id="drillcodes-send-title">{t("Send to drillcodes")}</h2>
          </div>
          <button type="button" className="icon-button" aria-label={t("Cancel")} onClick={onClose}>
            ×
          </button>
        </div>
        <p>{t("Keep the original drillcodes tab open.")}</p>
        <p className="dialog-message">
          {t("After sending, you will return to that tab to review and save the training.")}
        </p>
        <div className="button-row">
          <button type="button" className="button-secondary" onClick={onClose}>
            {t("Cancel")}
          </button>
          <button type="button" className="button-primary" onClick={confirm}>
            {t("Send and return to drillcodes")}
          </button>
        </div>
      </section>
    </div>
  );
}

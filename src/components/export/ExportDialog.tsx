import { useEffect, useMemo, useRef, useState } from "react";

import { useApp } from "../../app/AppProvider";
import { exportLongJson, exportV2 } from "../../domain/codec";
import { useTranslation } from "../../i18n/useTranslation";

function safeFilename(title: string): string {
  const normalized = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .replace(/[^a-zA-Z0-9_-]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .toLowerCase();
  return `${normalized || "drill"}.json`;
}

export function ExportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useApp();
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const dialogRef = useRef<HTMLElement>(null);
  const code = useMemo(
    () => (open && state.document ? exportV2(state.document) : ""),
    [open, state.document],
  );
  const longJson = useMemo(
    () => (open && state.document ? exportLongJson(state.document) : ""),
    [open, state.document],
  );

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
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
  }, [open]);

  useEffect(() => {
    if (!longJson) {
      setDownloadUrl("");
      return;
    }
    if (typeof URL.createObjectURL !== "function") {
      setDownloadUrl(`data:application/json;charset=utf-8,${encodeURIComponent(longJson)}`);
      return;
    }
    const url = URL.createObjectURL(
      new Blob([longJson], { type: "application/json;charset=utf-8" }),
    );
    setDownloadUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [longJson]);

  if (!open || !state.document) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setMessage(t("Code copied."));
    } catch {
      setMessage(t("The code could not be copied automatically. Select it below."));
    }
  };
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={dialogRef} className="export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-title">
        <div className="dialog-heading">
          <div><span className="eyebrow">SF6DRILL:v2</span><h2 id="export-title">{t("Export drill")}</h2></div>
          <button type="button" className="icon-button" aria-label={t("Close export")} onClick={onClose}>×</button>
        </div>
        <label htmlFor="export-code">{t("Code")}</label>
        <textarea id="export-code" readOnly rows={8} value={code} onFocus={(event) => event.target.select()} />
        {message && <p className="dialog-message" aria-live="polite">{message}</p>}
        <div className="button-row">
          <button type="button" className="button-primary" onClick={() => void copy()}>{t("Copy code")}</button>
          <a
            className="button-secondary button-link"
            href={downloadUrl}
            download={safeFilename(state.document.metadata.title)}
          >
            {t("Download JSON")}
          </a>
        </div>
      </section>
    </div>
  );
}

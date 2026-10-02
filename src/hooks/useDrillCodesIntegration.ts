import { useEffect, useMemo, useRef, useState } from "react";

import type { AppAction, AppState } from "../app/appTypes";
import { parseImport } from "../domain/codec";
import {
  createDrillCodesMessage,
  isDrillCodesMessage,
  MAX_INTEGRATION_CODE_LENGTH,
  readDrillCodesIntegrationConfig,
} from "../integration/drillCodesProtocol";
import { useTranslation } from "../i18n/useTranslation";

type IntegrationStatus = "inactive" | "waiting" | "imported" | "error";

type ImportPayload = {
  code: string;
  drillId?: string;
};

function readImportPayload(value: unknown): ImportPayload | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const payload = value as Record<string, unknown>;
  if (typeof payload.code !== "string") return null;
  if (payload.drillId !== undefined && typeof payload.drillId !== "string") return null;
  return { code: payload.code, drillId: payload.drillId as string | undefined };
}

export function useDrillCodesIntegration(
  state: AppState,
  dispatch: React.Dispatch<AppAction>,
) {
  const { t } = useTranslation();
  const config = useMemo(
    () => readDrillCodesIntegrationConfig(window.location.search, import.meta.env.DEV),
    [],
  );
  const [status, setStatus] = useState<IntegrationStatus>(config ? "waiting" : "inactive");
  const documentRef = useRef(state.document);
  const translateRef = useRef(t);

  useEffect(() => {
    documentRef.current = state.document;
    translateRef.current = t;
  }, [state.document, t]);

  useEffect(() => {
    if (!config) return;
    const opener = window.opener;
    if (!opener) {
      setStatus("error");
      return;
    }

    const send = (type: string, options?: { requestId?: string; payload?: unknown }) => {
      opener.postMessage(
        createDrillCodesMessage(type, config.channel, options),
        config.sourceOrigin,
      );
    };

    const receive = (event: MessageEvent) => {
      if (event.origin !== config.sourceOrigin || event.source !== opener) return;
      if (!isDrillCodesMessage(event.data, config.channel)) return;
      if (event.data.type !== "IMPORT_DRILL") return;

      const payload = readImportPayload(event.data.payload);
      if (!payload || payload.code.length > MAX_INTEGRATION_CODE_LENGTH) {
        setStatus("error");
        send("IMPORT_REJECTED", {
          requestId: event.data.requestId,
          payload: { error: "Invalid or oversized drill payload." },
        });
        return;
      }

      if (
        documentRef.current &&
        !window.confirm(translateRef.current("Replace the current drill with the one from DrillCodes?"))
      ) {
        send("IMPORT_CANCELLED", { requestId: event.data.requestId });
        return;
      }

      try {
        const result = parseImport(payload.code);
        dispatch({ type: "IMPORT_DOCUMENT", document: result.document });
        setStatus("imported");
        send("IMPORT_ACCEPTED", {
          requestId: event.data.requestId,
          payload: { title: result.document.metadata.title },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "The drill could not be imported.";
        dispatch({ type: "SET_IMPORT_ERROR", error: message });
        setStatus("error");
        send("IMPORT_REJECTED", {
          requestId: event.data.requestId,
          payload: { error: message },
        });
      }
    };

    window.addEventListener("message", receive);
    send("COUNTER_LAB_READY", {
      payload: {
        capabilities: ["IMPORT_DRILL"],
        maxCodeLength: MAX_INTEGRATION_CODE_LENGTH,
      },
    });
    return () => window.removeEventListener("message", receive);
  }, [config, dispatch]);

  return {
    active: config !== null,
    status,
    statusMessage:
      status === "imported"
        ? t("Drill imported from DrillCodes.")
        : status === "error"
          ? t("The DrillCodes connection is unavailable.")
          : "",
  };
}

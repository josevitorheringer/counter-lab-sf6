import { useEffect, useState } from "react";

import { DrillProperties } from "../components/metadata/DrillProperties";
import { InputEditor } from "../components/editor/InputEditor";
import { ExportDialog } from "../components/export/ExportDialog";
import { ImportPanel } from "../components/import/ImportPanel";
import { ImportDialog } from "../components/import/ImportDialog";
import { AppHeader } from "../components/app-shell/AppHeader";
import { AppShell } from "../components/app-shell/AppShell";
import { SlotList } from "../components/slots/SlotList";
import { Timeline } from "../components/timeline/Timeline";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useLocalDraft } from "../hooks/useLocalDraft";
import { useDrillCodesIntegration } from "../hooks/useDrillCodesIntegration";
import { NotationProvider } from "../notation/NotationProvider";
import { AppProvider, useApp } from "./AppProvider";

function AppContent() {
  const { state, dispatch } = useApp();
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  useLocalDraft(state, dispatch);
  useKeyboardShortcuts(state, dispatch);
  const drillCodes = useDrillCodesIntegration(state, dispatch);

  useEffect(() => {
    document.documentElement.dataset.colorMode = state.preferences.colorMode;
    document.documentElement.dataset.notation = state.preferences.notationTheme;
    document.documentElement.lang = state.preferences.language;
  }, [state.preferences.colorMode, state.preferences.notationTheme, state.preferences.language]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExportOpen(false);
        setImportOpen(false);
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);

  return (
    <NotationProvider themeId={state.preferences.notationTheme}>
      <AppShell>
        <AppHeader
          onImport={() => setImportOpen(true)}
          onExport={() => setExportOpen(true)}
          onSendToDrillCodes={drillCodes.canSend ? drillCodes.sendToDrillCodes : undefined}
          integrationStatus={drillCodes.active ? drillCodes.statusMessage : undefined}
        />
        {state.document ? (
          <main className="workspace">
            <SlotList />
            <div className="editor-column">
              <Timeline />
              <InputEditor />
            </div>
            <DrillProperties />
          </main>
        ) : (
          <ImportPanel />
        )}
        <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
        <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
      </AppShell>
    </NotationProvider>
  );
}

export function App() {
  return <AppProvider><AppContent /></AppProvider>;
}

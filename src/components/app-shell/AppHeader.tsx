import { useApp } from "../../app/AppProvider";
import { useTranslation } from "../../i18n/useTranslation";

export function AppHeader({
  onImport,
  onExport,
  integrationStatus,
}: {
  onImport?: () => void;
  onExport?: () => void;
  integrationStatus?: string;
}) {
  const { state, dispatch } = useApp();
  const { t } = useTranslation();
  return (
    <header className="app-header">
      <span className="brand-button">Counter Lab</span>
      {state.document && <span className="header-title">{state.document.metadata.title}</span>}
      {integrationStatus && <span className="integration-status" aria-live="polite">{integrationStatus}</span>}
      <div className="header-controls">
        <label>
          <span className="sr-only">{t("Notation")}</span>
          <select
            value={state.preferences.notationTheme}
            onChange={(event) =>
              dispatch({
                type: "SET_NOTATION_THEME",
                theme: event.target.value as "numpad" | "sf6",
              })
            }
          >
            <option value="numpad">{t("Numeric")}</option>
            <option value="sf6">SF6 visual</option>
          </select>
        </label>
        <label>
          <span className="sr-only">{t("Appearance")}</span>
          <select
            value={state.preferences.colorMode}
            onChange={(event) =>
              dispatch({
                type: "SET_COLOR_MODE",
                mode: event.target.value as "system" | "light" | "dark",
              })
            }
          >
            <option value="system">{t("System")}</option>
            <option value="light">{t("Light")}</option>
            <option value="dark">{t("Dark")}</option>
          </select>
        </label>
        <label>
          <span className="sr-only">{t("Language")}</span>
          <select
            value={state.preferences.language}
            onChange={(event) => dispatch({ type: "SET_LANGUAGE", language: event.target.value as "en" | "pt-BR" })}
          >
            <option value="en">{t("English")}</option>
            <option value="pt-BR">{t("Portuguese")}</option>
          </select>
        </label>
        {state.document && (
          <>
            <button type="button" className="button-secondary" onClick={onImport}>
              {t("Import")}
            </button>
            <button type="button" className="button-primary" onClick={onExport}>
              {t("Export")}
            </button>
          </>
        )}
      </div>
    </header>
  );
}

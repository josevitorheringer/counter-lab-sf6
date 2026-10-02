import { useEffect, useState } from "react";

import { useApp } from "../../app/AppProvider";
import { CHARACTERS, findCharacter } from "../../domain/characters";
import { useTranslation } from "../../i18n/useTranslation";

export function DrillProperties() {
  const { state, dispatch } = useApp();
  const { t } = useTranslation();
  const metadata = state.document?.metadata;
  const [title, setTitle] = useState(metadata?.title ?? "");
  const [author, setAuthor] = useState(metadata?.author ?? "");
  const [description, setDescription] = useState(metadata?.description ?? "");

  useEffect(() => {
    setTitle(metadata?.title ?? "");
    setAuthor(metadata?.author ?? "");
    setDescription(metadata?.description ?? "");
  }, [metadata?.title, metadata?.author, metadata?.description]);

  if (!state.document) return null;
  const compatibility = state.document.compatibility;
  const currentCharacter = findCharacter(compatibility.dummy_character_id);
  const update = (changes: { title?: string; author?: string; description?: string }) =>
    dispatch({ type: "UPDATE_METADATA", changes });

  return (
    <aside className="properties-panel" aria-labelledby="properties-title">
      <div className="panel-heading"><h2 id="properties-title">{t("Properties")}</h2></div>
      <label>
        <span>{t("Name")}</span>
        <input
          value={title}
          required
          onChange={(event) => setTitle(event.target.value)}
          onBlur={() => {
            if (!title.trim()) setTitle(metadata?.title ?? "");
            else if (title !== metadata?.title) update({ title });
          }}
        />
      </label>
      <label>
        <span>{t("Author")}</span>
        <input value={author} onChange={(event) => setAuthor(event.target.value)} onBlur={() => author !== metadata?.author && update({ author })} />
      </label>
      <label>
        <span>{t("Description")}</span>
        <textarea rows={5} value={description} onChange={(event) => setDescription(event.target.value)} onBlur={() => description !== metadata?.description && update({ description })} />
      </label>
      <label>
        <span>{t("Dummy character")}</span>
        <select
          value={compatibility.dummy_character_id}
          onChange={(event) => {
            const character = findCharacter(Number(event.target.value));
            if (character) dispatch({ type: "UPDATE_DUMMY_CHARACTER", character });
          }}
        >
          {!currentCharacter && (
            <option value={compatibility.dummy_character_id}>
              {compatibility.dummy_character_name ?? t("Unknown character")} (ID {compatibility.dummy_character_id})
            </option>
          )}
          {CHARACTERS.map((character) => (
            <option key={character.id} value={character.id}>
              {character.name}
            </option>
          ))}
        </select>
      </label>
      <dl className="compatibility-info">
        <div><dt>{t("Dummy ID")}</dt><dd>{compatibility.dummy_character_id}</dd></div>
        <div><dt>{t("Schema")}</dt><dd>v{state.document.version}</dd></div>
      </dl>
      <p className="field-note">{t("The dummy character must match the one selected in Training Mode.")}</p>
    </aside>
  );
}

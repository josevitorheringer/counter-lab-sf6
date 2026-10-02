import { type DragEvent, type ChangeEvent, useRef, useState } from "react";
import { useTranslation } from "../../i18n/useTranslation";

export function FileDropZone({ onText }: { onText: (text: string) => void }) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const readFile = async (file?: File) => {
    if (file) onText(await file.text());
  };
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void readFile(event.dataTransfer.files[0]);
  };
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    void readFile(event.target.files?.[0]);
  };

  return (
    <div
      className={`file-drop${dragging ? " is-dragging" : ""}`}
      onDragEnter={() => setDragging(true)}
      onDragLeave={() => setDragging(false)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      <span>{t("Drop a JSON or SF6DRILL file here")}</span>
      <button type="button" className="button-secondary" onClick={() => inputRef.current?.click()}>
        {t("Select file")}
      </button>
      <input ref={inputRef} className="sr-only" type="file" accept=".json,.txt,text/plain,application/json" onChange={onChange} />
    </div>
  );
}

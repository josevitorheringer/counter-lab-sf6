import { useCallback } from "react";

import { useApp } from "../app/AppProvider";
import type { Language } from "../app/appTypes";
import type { InputMaskDescription } from "../domain/masks";

const PT: Record<string, string> = {
  Notation: "Notação",
  Numeric: "Numérica",
  Appearance: "Aparência",
  System: "Sistema",
  Light: "Claro",
  Dark: "Escuro",
  Language: "Idioma",
  English: "Inglês",
  Portuguese: "Português",
  Import: "Importar",
  Export: "Exportar",
  Buttons: "Botões",
  Direction: "Direção",
  "Direction {number}": "Direção {number}",
  "Duration in frames": "Duração em frames",
  "Decrease by one frame": "Diminuir um frame",
  "Increase by one frame": "Aumentar um frame",
  "Block {number}": "Bloco {number}",
  "New block": "Novo bloco",
  Input: "Input",
  mask: "máscara",
  "Save block": "Salvar bloco",
  "Add block": "Adicionar bloco",
  Duplicate: "Duplicar",
  Delete: "Excluir",
  Cancel: "Cancelar",
  "Add sequence": "Adicionar sequência",
  Presets: "Predefinições",
  Dash: "Dash",
  "Quarter-circle forward + LP": "Quarto de círculo para frente + LP",
  "Dragon punch + LP": "Dragon punch + LP",
  Throw: "Agarrão",
  "Drive Parry": "Drive Parry",
  "Drive Impact": "Drive Impact",
  "Export drill": "Exportar drill",
  "Close export": "Fechar exportação",
  Code: "Código",
  "Copy code": "Copiar código",
  "Download JSON": "Baixar JSON",
  "Code copied.": "Código copiado.",
  "The code could not be copied automatically. Select it below.": "Não foi possível copiar o código automaticamente. Selecione-o abaixo.",
  "Drop a JSON or SF6DRILL file here": "Solte um arquivo JSON ou SF6DRILL aqui",
  "Select file": "Selecionar arquivo",
  "Current drill remains open": "O drill atual continua aberto",
  "Import another drill": "Importar outro drill",
  "Cancel import": "Cancelar importação",
  "Import drill": "Importar drill",
  "Your current drill will only be replaced after the new drill is validated.": "O drill atual só será substituído depois que o novo drill for validado.",
  "SF6DRILL code or JSON": "Código SF6DRILL ou JSON",
  "Replace drill": "Substituir drill",
  "Load example": "Carregar exemplo",
  "Resume draft": "Retomar rascunho",
  "Processing happens in this browser.": "O processamento acontece neste navegador.",
  "The drill could not be imported.": "Não foi possível importar o drill.",
  Properties: "Propriedades",
  Name: "Nome",
  Author: "Autor",
  Description: "Descrição",
  "Dummy character": "Personagem dummy",
  "Unknown character": "Personagem desconhecido",
  "Dummy ID": "ID do dummy",
  Schema: "Schema",
  "The dummy character must match the one selected in Training Mode.": "O personagem dummy deve ser o mesmo selecionado no Modo Treino.",
  "Recording slots": "Slots de gravação",
  Slots: "Slots",
  "Copy to": "Copiar para",
  Copy: "Copiar",
  "Clear every input from this slot?": "Remover todos os inputs deste slot?",
  "Clear slot": "Limpar slot",
  Recorded: "Gravado",
  Empty: "Vazio",
  "Input sequence": "Sequência de inputs",
  Frames: "Frames",
  Time: "Tempo",
  Blocks: "Blocos",
  "Input timeline": "Timeline de inputs",
  "This slot is empty.": "Este slot está vazio.",
  "Move block left": "Mover bloco para a esquerda",
  "Move block right": "Mover bloco para a direita",
  History: "Histórico",
  Undo: "Desfazer",
  Redo: "Refazer",
  Zoom: "Zoom",
  "Example — quarter-circle": "Exemplo — quarto de círculo",
  "Local example drill.": "Drill de exemplo local.",
};

export function translate(
  language: Language,
  key: string,
  variables: Record<string, string | number> = {},
): string {
  const template = language === "pt-BR" ? (PT[key] ?? key) : key;
  return Object.entries(variables).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    template,
  );
}

export function useTranslation() {
  const { state } = useApp();
  const language = state.preferences.language;
  const t = useCallback(
    (key: string, variables?: Record<string, string | number>) =>
      translate(language, key, variables),
    [language],
  );
  return { language, t };
}

const DIRECTIONS_PT = {
  1: "Baixo-trás",
  2: "Baixo",
  3: "Baixo-frente",
  4: "Trás",
  5: "Neutro",
  6: "Frente",
  7: "Cima-trás",
  8: "Cima",
  9: "Cima-frente",
} as const;

const BUTTONS_PT = {
  LP: "soco leve",
  MP: "soco médio",
  HP: "soco pesado",
  LK: "chute leve",
  MK: "chute médio",
  HK: "chute pesado",
} as const;

export function localizedInputLabel(input: InputMaskDescription, language: Language): string {
  if (language === "en") return input.accessibleLabel;
  const parts = [
    input.direction === null ? `Direção desconhecida ${input.mask & 15}` : DIRECTIONS_PT[input.direction],
    ...input.buttons.map((button) => BUTTONS_PT[button]),
    input.preservedBits !== 0 ? `bits preservados ${input.preservedBits}` : "",
  ].filter(Boolean);
  return parts.join(" + ");
}

export function localizeError(message: string, language: Language): string {
  if (language === "en") return message;
  const exact: Record<string, string> = {
    "The Base64 code is invalid.": "O código Base64 é inválido.",
    "The Base64 payload could not be decoded as UTF-8.": "O conteúdo Base64 não pôde ser decodificado como UTF-8.",
    "The content is not valid JSON.": "O conteúdo não é um JSON válido.",
    "Paste an SF6DRILL code or JSON document.": "Cole um código SF6DRILL ou documento JSON.",
    "This SF6DRILL code version is not supported.": "Esta versão do código SF6DRILL não é compatível.",
    "Use an SF6DRILL:v1/v2 code or a long-form JSON document starting with `{`.": "Use um código SF6DRILL:v1/v2 ou um documento JSON longo iniciado por `{`.",
    "The drill must be a JSON object.": "O drill deve ser um objeto JSON.",
    "The schema version must be 1.": "A versão do schema deve ser 1.",
    "metadata.title is required.": "metadata.title é obrigatório.",
    "A drill supports at most eight slots.": "Um drill aceita no máximo oito slots.",
    "The RLE sequence must contain [count, value] pairs.": "A sequência RLE deve conter pares [quantidade, valor].",
  };
  if (exact[message]) return exact[message];
  return message
    .replace(" must be an object", " deve ser um objeto")
    .replace(" must be an array", " deve ser um array")
    .replace(" must be an integer", " deve ser um número inteiro")
    .replace(" must be a string", " deve ser uma string")
    .replace(" must be true or false", " deve ser verdadeiro ou falso")
    .replace(" must be at least ", " deve ser no mínimo ")
    .replace(" must be at most ", " deve ser no máximo ")
    .replace(" must be between ", " deve estar entre ")
    .replace(" is outside the 1–8 range", " está fora do intervalo de 1 a 8")
    .replace(" appears more than once", " aparece mais de uma vez")
    .replace(" supports at most 10 entries", " aceita no máximo 10 entradas")
    .replace(" contains an invalid value", " contém um valor inválido")
    .replace(" is invalid", " é inválido")
    .replace(" is not supported", " não é compatível");
}

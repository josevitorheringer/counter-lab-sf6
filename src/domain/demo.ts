import { INPUT_PRESETS } from "./presets";
import { expandBlocks } from "./timeline";
import type { DrillDocument } from "./types";
import { createEmptySlot, normalizeDrill, RECORDED_SLOT_GUID } from "./validation";
import type { Language } from "../app/appTypes";

export function createDemoDrill(language: Language = "en"): DrillDocument {
  const isPortuguese = language === "pt-BR";
  const slots = Array.from({ length: 8 }, (_, index) => createEmptySlot(index + 1));
  const rawInputs = expandBlocks(INPUT_PRESETS["quarter-circle-forward"].blocks);
  slots[0] = {
    ...slots[0],
    raw_inputs: rawInputs,
    frame_count: rawInputs.length,
    is_active: true,
    is_valid: true,
    state: 1,
    title: structuredClone(RECORDED_SLOT_GUID),
  };
  return normalizeDrill({
    version: 1,
    metadata: {
      id: crypto.randomUUID(),
      title: isPortuguese ? "Exemplo — quarto de círculo" : "Example — quarter-circle",
      author: "Counter Lab",
      description: isPortuguese ? "Drill de exemplo local." : "Local example drill.",
      created_at: new Date().toISOString(),
      tags: [],
    },
    compatibility: { dummy_character_id: 1, dummy_character_name: "Ryu" },
    action_record: {
      playback_mode: 0,
      global_settings: { play_type: 0 },
      slots,
    },
  });
}

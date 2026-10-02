export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue | undefined };

export type SlotGuid = JsonObject & {
  mData1: number;
  mData2: number;
  mData3: number;
  mData4_0: number;
  mData4_1: number;
  mData4_2: number;
  mData4_3: number;
  mData4_4: number;
  mData4_5: number;
  mData4_6: number;
  mData4_7: number;
};

export type DrillMetadata = JsonObject & {
  id?: string;
  title: string;
  author?: string;
  description?: string;
  created_at?: string;
  tags?: string[];
};

export type Compatibility = JsonObject & {
  dummy_character_id: number;
  dummy_character_name?: string;
  player_character_id?: number;
};

export type TrainingSettings = JsonObject & {
  dummy_stance?: number;
  dummy_guard?: number;
  dummy_guard_switch?: number;
  block_count?: number;
  switch_block_active?: boolean | 0 | 1;
  block_type?: number;
  drive_reversal?: number;
  drive_reversal_delay?: number;
  drive_reversal_count?: number;
  throw_escape?: number;
  dummy_recovery?: number;
  dummy_counter?: number;
  dummy_counter_nc?: number;
  dummy_counter_pc?: number;
  player_drive_gauge?: number;
  dummy_drive_gauge?: number;
  player_super_gauge?: number;
  dummy_super_gauge?: number;
  stage_position?: string;
};

export type GlobalSettings = JsonObject & {
  info_type?: number;
  loop_type?: number;
  play_type?: number;
  record_countdown?: number;
  record_start_type?: number;
  record_type?: number;
};

export type RecordingSlot = JsonObject & {
  slot_index: number;
  raw_inputs: number[];
  frame_count: number;
  is_active: boolean;
  is_valid: boolean;
  weight: number;
  state: number;
  is_loop: boolean;
  cmd_type: number;
  negative_edge: boolean;
  title: SlotGuid;
};

export type ReversalData = JsonObject & {
  Type: number;
  SkillIndex: number;
  IsValid: boolean;
  IsActive: boolean;
  IsFrame: boolean;
  Frame: number;
  Delay: number;
  Count: number;
  Level: number;
};

export type ReversalSlots = JsonObject & {
  down: ReversalData[];
  guard: ReversalData[];
  damage: ReversalData[];
};

export type ActionRecord = JsonObject & {
  playback_mode?: number;
  global_settings?: GlobalSettings;
  slots: RecordingSlot[];
  reversal_slots?: ReversalSlots;
};

export type DrillDocument = JsonObject & {
  version: 1;
  metadata: DrillMetadata;
  compatibility: Compatibility;
  training_settings?: TrainingSettings;
  action_record: ActionRecord;
};

export type InputBlock = {
  frames: number;
  mask: number;
};

export type ImportSourceFormat = "json" | "v1" | "v2";

export type ImportResult = {
  document: DrillDocument;
  sourceFormat: ImportSourceFormat;
};

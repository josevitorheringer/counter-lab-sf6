export const DRILL_CODES_PROTOCOL = "counter-lab";
export const DRILL_CODES_PROTOCOL_VERSION = 1;
export const MAX_INTEGRATION_CODE_LENGTH = 10_000_000;

export type DrillCodesIntegrationConfig = {
  channel: string;
  sourceOrigin: string;
};

export type DrillCodesMessage = {
  protocol: typeof DRILL_CODES_PROTOCOL;
  version: typeof DRILL_CODES_PROTOCOL_VERSION;
  type: string;
  channel: string;
  requestId?: string;
  payload?: unknown;
};

const PRODUCTION_ORIGINS = new Set([
  "https://drillcodes.com",
  "https://www.drillcodes.com",
]);

const DEVELOPMENT_ORIGINS = new Set([
  "http://127.0.0.1:4174",
  "http://localhost:4174",
]);

export function isAllowedDrillCodesOrigin(origin: string, development: boolean): boolean {
  return PRODUCTION_ORIGINS.has(origin) || (development && DEVELOPMENT_ORIGINS.has(origin));
}

export function readDrillCodesIntegrationConfig(
  search: string,
  development: boolean,
): DrillCodesIntegrationConfig | null {
  const parameters = new URLSearchParams(search);
  if (parameters.get("integration") !== "drillcodes") return null;

  const channel = parameters.get("channel") ?? "";
  const sourceOrigin = parameters.get("sourceOrigin") ?? "https://drillcodes.com";
  if (!/^[a-zA-Z0-9_-]{8,128}$/u.test(channel)) return null;
  if (!isAllowedDrillCodesOrigin(sourceOrigin, development)) return null;

  return { channel, sourceOrigin };
}

export function isDrillCodesMessage(value: unknown, channel: string): value is DrillCodesMessage {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const message = value as Record<string, unknown>;
  return (
    message.protocol === DRILL_CODES_PROTOCOL &&
    message.version === DRILL_CODES_PROTOCOL_VERSION &&
    message.channel === channel &&
    typeof message.type === "string" &&
    (message.requestId === undefined || typeof message.requestId === "string")
  );
}

export function createDrillCodesMessage(
  type: string,
  channel: string,
  options: { requestId?: string; payload?: unknown } = {},
): DrillCodesMessage {
  return {
    protocol: DRILL_CODES_PROTOCOL,
    version: DRILL_CODES_PROTOCOL_VERSION,
    type,
    channel,
    ...options,
  };
}

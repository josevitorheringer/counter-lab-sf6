import { describe, expect, it } from "vitest";

import {
  createDrillCodesMessage,
  isDrillCodesMessage,
  readDrillCodesIntegrationConfig,
} from "./drillCodesProtocol";

describe("DrillCodes integration protocol", () => {
  it("accepts HTTPS origins and a valid channel", () => {
    expect(
      readDrillCodesIntegrationConfig(
        "?integration=drillcodes&channel=channel_123&sourceOrigin=https%3A%2F%2Fdrillcodes.com",
        false,
      ),
    ).toEqual({ channel: "channel_123", sourceOrigin: "https://drillcodes.com" });

    expect(
      readDrillCodesIntegrationConfig(
        "?integration=drillcodes&channel=channel_123&sourceOrigin=https%3A%2F%2Fcommunity.example",
        false,
      ),
    ).toEqual({ channel: "channel_123", sourceOrigin: "https://community.example" });
  });

  it("accepts HTTP loopback origins when testing a production build", () => {
    const search =
      "?integration=drillcodes&channel=channel_123&sourceOrigin=http%3A%2F%2F127.0.0.1%3A5123";
    expect(readDrillCodesIntegrationConfig(search, false)).toEqual({
      channel: "channel_123",
      sourceOrigin: "http://127.0.0.1:5123",
    });
    expect(readDrillCodesIntegrationConfig(search, true)).toEqual({
      channel: "channel_123",
      sourceOrigin: "http://127.0.0.1:5123",
    });
  });

  it("rejects insecure remote origins, invalid channels, and unrelated messages", () => {
    expect(
      readDrillCodesIntegrationConfig(
        "?integration=drillcodes&channel=channel_123&sourceOrigin=http%3A%2F%2Fcommunity.example",
        true,
      ),
    ).toBeNull();
    expect(
      readDrillCodesIntegrationConfig(
        "?integration=drillcodes&channel=channel_123&sourceOrigin=http%3A%2F%2F192.168.1.10%3A4174",
        true,
      ),
    ).toBeNull();
    expect(
      readDrillCodesIntegrationConfig(
        "?integration=drillcodes&channel=x&sourceOrigin=https%3A%2F%2Fdrillcodes.com",
        true,
      ),
    ).toBeNull();
    expect(isDrillCodesMessage({ type: "IMPORT_DRILL" }, "channel_123")).toBe(false);
  });

  it("creates versioned messages for the active channel", () => {
    const message = createDrillCodesMessage("COUNTER_LAB_READY", "channel_123");
    expect(message).toMatchObject({
      protocol: "counter-lab",
      version: 1,
      type: "COUNTER_LAB_READY",
      channel: "channel_123",
    });
    expect(isDrillCodesMessage(message, "channel_123")).toBe(true);
  });
});

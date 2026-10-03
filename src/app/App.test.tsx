import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";
import { exportV2 } from "../domain/codec";
import { createLongDrillFixture } from "../test/fixtures";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      "counter-lab:preferences:v1",
      JSON.stringify({
        notationTheme: "numpad",
        colorMode: "system",
        timelineZoom: 100,
        language: "en",
      }),
    );
    window.history.replaceState({}, "", "/");
    Object.defineProperty(window, "opener", { configurable: true, value: null });
  });

  it("uses Portuguese and SF6 visual notation by default", () => {
    localStorage.clear();
    render(<App />);

    expect(screen.getByRole("heading", { name: "Importar drill" })).toBeInTheDocument();
    expect(screen.getByLabelText("Idioma")).toHaveValue("pt-BR");
    expect(screen.getByLabelText("Notação")).toHaveValue("sf6");
    expect(document.documentElement.lang).toBe("pt-BR");
    expect(document.documentElement.dataset.notation).toBe("sf6");
  });

  afterEach(() => {
    window.history.replaceState({}, "", "/");
    Object.defineProperty(window, "opener", { configurable: true, value: null });
  });

  it("opens in the import flow", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Import drill" })).toBeInTheDocument();
    expect(screen.getByLabelText("SF6DRILL code or JSON")).toBeInTheDocument();
  });

  it("switches the whole interface to Portuguese", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Language"), {
      target: { value: "pt-BR" },
    });

    expect(screen.getByRole("heading", { name: "Importar drill" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Carregar exemplo" })).toBeInTheDocument();
    expect(screen.getByLabelText("Código SF6DRILL ou JSON")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("pt-BR");

    fireEvent.change(screen.getByLabelText("Código SF6DRILL ou JSON"), {
      target: { value: "invalid" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Importar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Use um código SF6DRILL:v1/v2");
  });

  it("loads the example and displays the complete workspace", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Load example" }));

    expect(screen.getByRole("heading", { name: "Slots" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Input sequence" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Input" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Properties" })).toBeInTheDocument();
  });

  it("opens v2 export", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Load example" }));
    fireEvent.click(screen.getByRole("button", { name: "Export" }));

    expect(screen.getByRole("dialog", { name: "Export drill" })).toBeInTheDocument();
    expect((screen.getByLabelText("Code") as HTMLTextAreaElement).value).toMatch(
      /^SF6DRILL:v2:/,
    );
  });

  it("imports a realistic code and edits a block with clickable controls", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("SF6DRILL code or JSON"), {
      target: { value: exportV2(createLongDrillFixture()) },
    });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));

    const firstTwoFrames = screen.getAllByText("4f")[0].closest("button");
    expect(firstTwoFrames).not.toBeNull();
    fireEvent.click(firstTwoFrames!);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Duration in frames" }), {
      target: { value: "6" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save block" }));

    expect(screen.getByText("26f · 0.43s")).toBeInTheDocument();
  });

  it("shows an import error without leaving the screen", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("SF6DRILL code or JSON"), {
      target: { value: "not a drill" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/SF6DRILL:v1\/v2/);
  });

  it("changes the dummy character from the properties panel", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Load example" }));
    fireEvent.change(screen.getByLabelText("Dummy character"), {
      target: { value: "22" },
    });

    expect(screen.getByText("22")).toBeInTheDocument();
    expect(screen.getByLabelText("Dummy character")).toHaveValue("22");
  });

  it("changes the weight of an individual slot", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Load example" }));
    const weight = screen.getByLabelText("Weight for Slot 1");
    fireEvent.change(weight, { target: { value: "0" } });

    expect(weight).toHaveValue(0);
  });

  it("opens import in a cancellable dialog without discarding the current drill", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Load example" }));
    fireEvent.click(screen.getByRole("button", { name: "Import" }));

    expect(screen.getByRole("dialog", { name: "Import another drill" })).toBeInTheDocument();
    expect(screen.getByText("Example — quarter-circle")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel import" }));
    expect(screen.queryByRole("dialog", { name: "Import another drill" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Input sequence" })).toBeInTheDocument();
    expect(screen.getByText("Example — quarter-circle")).toBeInTheDocument();
  });

  it("keeps the current drill when a replacement import is invalid", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Load example" }));
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    fireEvent.change(screen.getByLabelText("SF6DRILL code or JSON"), {
      target: { value: "invalid replacement" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Replace drill" }));

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Import another drill" })).toBeInTheDocument();
    expect(screen.getByText("Example — quarter-circle")).toBeInTheDocument();
  });

  it("replaces the current drill only after a valid import", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Load example" }));
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    fireEvent.change(screen.getByLabelText("SF6DRILL code or JSON"), {
      target: { value: exportV2(createLongDrillFixture()) },
    });
    fireEvent.click(screen.getByRole("button", { name: "Replace drill" }));

    expect(screen.queryByRole("dialog", { name: "Import another drill" })).not.toBeInTheDocument();
    expect(screen.getByText("Hadoken — medium pressure")).toBeInTheDocument();
  });

  it("imports from and exports to a trusted DrillCodes opener", async () => {
    const postMessage = vi.fn();
    const focus = vi.fn();
    const opener = { postMessage, focus, closed: false } as unknown as Window;
    Object.defineProperty(window, "opener", { configurable: true, value: opener });
    window.history.replaceState(
      {},
      "",
      "/?integration=drillcodes&channel=channel_123&sourceOrigin=http%3A%2F%2F127.0.0.1%3A4174",
    );

    render(<App />);
    await waitFor(() =>
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "COUNTER_LAB_READY",
          channel: "channel_123",
          payload: expect.objectContaining({ capabilities: ["IMPORT_DRILL", "EXPORT_DRILL"] }),
        }),
        "http://127.0.0.1:4174",
      ),
    );

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "http://127.0.0.1:4174",
          source: opener,
          data: {
            protocol: "counter-lab",
            version: 1,
            type: "IMPORT_DRILL",
            channel: "channel_123",
            requestId: "request_123",
            payload: {
              drillId: "drill_123",
              code: exportV2(createLongDrillFixture()),
            },
          },
        }),
      );
    });

    expect(await screen.findByText("Drill imported from DrillCodes.")).toBeInTheDocument();
    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "IMPORT_ACCEPTED",
        channel: "channel_123",
        requestId: "request_123",
      }),
      "http://127.0.0.1:4174",
    );
    fireEvent.click(screen.getByRole("button", { name: "Send to DrillCodes" }));

    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "EXPORT_DRILL",
        channel: "channel_123",
        payload: expect.objectContaining({
          sourceDrillId: "drill_123",
          code: expect.stringMatching(/^SF6DRILL:v2:/),
          metadata: expect.objectContaining({ title: "Hadoken — medium pressure" }),
        }),
      }),
      "http://127.0.0.1:4174",
    );
    expect(screen.getByText("Sent! Continue on DrillCodes.")).toBeInTheDocument();
    expect(focus).toHaveBeenCalledOnce();
  });
});

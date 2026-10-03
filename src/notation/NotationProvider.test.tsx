import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InputNotation, NotationProvider } from "./NotationProvider";
import { AppProvider } from "../app/AppProvider";

describe("notation themes", () => {
  it("produces the same accessible text in both themes", () => {
    const { rerender } = render(
      <AppProvider><NotationProvider themeId="numpad">
        <InputNotation mask={130} />
      </NotationProvider></AppProvider>,
    );
    expect(screen.getByLabelText("Baixo + chute leve")).toBeInTheDocument();

    rerender(
      <AppProvider><NotationProvider themeId="sf6">
        <InputNotation mask={130} />
      </NotationProvider></AppProvider>,
    );
    expect(screen.getByLabelText("Baixo + chute leve")).toBeInTheDocument();
  });

  it("keeps a textual strength identifier in the SF6 theme", () => {
    render(
      <AppProvider><NotationProvider themeId="sf6">
        <InputNotation mask={64} />
      </NotationProvider></AppProvider>,
    );
    expect(screen.getByText("H")).toBeInTheDocument();
  });
});

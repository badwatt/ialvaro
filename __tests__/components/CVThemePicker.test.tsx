import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CVThemePicker } from "src/components/CVThemePicker";
import { CV_THEMES, getThemeById } from "src/utils/cvThemes";

afterEach(() => cleanup());

describe("<CVThemePicker />", () => {
  it("renders a card for every built-in theme", () => {
    render(<CVThemePicker selectedId="default" onSelect={() => {}} />);
    for (const theme of CV_THEMES) {
      expect(screen.getByLabelText(`Select ${theme.name} theme`)).toBeDefined();
    }
  });

  it("marks the selected card as pressed", () => {
    render(<CVThemePicker selectedId="mocha" onSelect={() => {}} />);
    const selected = screen.getByLabelText("Select Catppuccin Mocha theme");
    const unselected = screen.getByLabelText("Select Default theme");
    expect(selected.getAttribute("aria-pressed")).toBe("true");
    expect(unselected.getAttribute("aria-pressed")).toBe("false");
    expect(selected.getAttribute("data-selected")).toBe("true");
    expect(unselected.getAttribute("data-selected")).toBe("false");
  });

  it("calls onSelect with the chosen theme when clicked", () => {
    const onSelect = vi.fn();
    render(<CVThemePicker selectedId="default" onSelect={onSelect} />);
    const emeraldCard = screen.getByLabelText("Select Emerald theme");
    emeraldCard.click();
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(getThemeById("emerald"));
  });

  it("shows a Selected badge on the active card only", () => {
    render(<CVThemePicker selectedId="white" onSelect={() => {}} />);
    const selectedCard = screen.getByLabelText("Select Classic White theme");
    const otherCard = screen.getByLabelText("Select Default theme");
    expect(selectedCard.textContent).toContain("Selected");
    expect(otherCard.textContent).not.toContain("Selected");
  });

  it("renders theme description text", () => {
    render(<CVThemePicker selectedId="default" onSelect={() => {}} />);
    expect(screen.getByText("The current dark palette.")).toBeDefined();
    expect(screen.getByText("Formal, recruiter-friendly.")).toBeDefined();
    expect(screen.getByText("Soothing pastels, lavender accent.")).toBeDefined();
    expect(screen.getByText("Deep green with a vibrant accent.")).toBeDefined();
  });

  it("applies the base color inline on the base swatch", () => {
    render(<CVThemePicker selectedId="mocha" onSelect={() => {}} />);
    const mochaCard = screen.getByLabelText("Select Catppuccin Mocha theme");
    const swatch = mochaCard.querySelector("[data-testid='swatch-base']") as HTMLElement;
    expect(swatch.style.backgroundColor).toBe("rgb(30, 30, 46)");
  });
});

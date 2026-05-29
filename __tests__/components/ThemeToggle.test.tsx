import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeToggle } from "src/components/ThemeToggle";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: false } as MediaQueryList);
  });
  afterEach(cleanup);

  it("renders toggle button", () => {
    render(<ThemeToggle />);
    const btn = screen.getByLabelText(/toggle theme/i);
    expect(btn).toBeDefined();
    expect(btn.classList.contains("cursor-pointer")).toBe(true);
  });

  it("toggles from dark to light", () => {
    render(<ThemeToggle />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    const btn = screen.getByLabelText(/toggle theme/i);
    act(() => {
      fireEvent.click(btn);
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("toggles back to dark", () => {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
    render(<ThemeToggle />);
    const btn = screen.getByLabelText(/toggle theme/i);

    act(() => {
      fireEvent.click(btn);
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("uses localStorage value when set", () => {
    localStorage.setItem("theme", "light");
    render(<ThemeToggle />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("falls back to system preference when no localStorage", () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList);
    render(<ThemeToggle />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("defaults to dark when system prefers dark", () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: false } as MediaQueryList);
    render(<ThemeToggle />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});

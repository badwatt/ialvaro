import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, afterEach, beforeEach, vi } from "vitest";

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: false } as MediaQueryList);
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("renders toggle button", async () => {
    const { ThemeToggle } = await import("src/components/ThemeToggle");
    render(<ThemeToggle />);
    const btn = screen.getByLabelText(/toggle theme/i);
    expect(btn).toBeDefined();
    expect(btn.classList.contains("cursor-pointer")).toBe(true);
  });

  it("toggles from dark to light", async () => {
    const { ThemeToggle } = await import("src/components/ThemeToggle");
    render(<ThemeToggle />);

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    const btn = screen.getByLabelText(/toggle theme/i);
    act(() => {
      fireEvent.click(btn);
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("toggles back to dark", async () => {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");

    const { ThemeToggle } = await import("src/components/ThemeToggle");
    render(<ThemeToggle />);
    const btn = screen.getByLabelText(/toggle theme/i);

    act(() => {
      fireEvent.click(btn);
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("uses localStorage value when set", async () => {
    localStorage.setItem("theme", "light");

    const { ThemeToggle } = await import("src/components/ThemeToggle");
    render(<ThemeToggle />);

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("falls back to system preference (light) when no localStorage", async () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList);

    const { ThemeToggle } = await import("src/components/ThemeToggle");
    render(<ThemeToggle />);

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("defaults to dark when no localStorage and system prefers dark", async () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: false } as MediaQueryList);

    const { ThemeToggle } = await import("src/components/ThemeToggle");
    render(<ThemeToggle />);

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("defaults to dark in SSR environment (window undefined)", async () => {
    const savedWindow = globalThis.window;
    Object.defineProperty(globalThis, "window", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    vi.resetModules();
    const { ThemeToggle } = await import("src/components/ThemeToggle");

    Object.defineProperty(globalThis, "window", {
      value: savedWindow,
      writable: true,
      configurable: true,
    });

    render(<ThemeToggle />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});

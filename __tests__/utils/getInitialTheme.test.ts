import { describe, expect, it, vi, afterEach } from "vitest";

describe("getInitialTheme", () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("returns dark by default", async () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: false } as MediaQueryList);
    const { getInitialTheme } = await import("src/utils/getInitialTheme");
    expect(getInitialTheme()).toBe("dark");
  });

  it("returns stored light theme", async () => {
    localStorage.setItem("theme", "light");
    const { getInitialTheme } = await import("src/utils/getInitialTheme");
    expect(getInitialTheme()).toBe("light");
  });

  it("returns stored dark theme", async () => {
    localStorage.setItem("theme", "dark");
    const { getInitialTheme } = await import("src/utils/getInitialTheme");
    expect(getInitialTheme()).toBe("dark");
  });

  it("returns light when system prefers light", async () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    const { getInitialTheme } = await import("src/utils/getInitialTheme");
    expect(getInitialTheme()).toBe("light");
  });

  it("returns dark when window is undefined (SSR)", async () => {
    const savedWindow = globalThis.window;
    Object.defineProperty(globalThis, "window", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    vi.resetModules();
    const { getInitialTheme } = await import("src/utils/getInitialTheme");
    expect(getInitialTheme()).toBe("dark");
    Object.defineProperty(globalThis, "window", {
      value: savedWindow,
      writable: true,
      configurable: true,
    });
  });
});

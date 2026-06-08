import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useZoom, getResponsiveDefaultZoom } from "src/hooks/useZoom";

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches,
      media: "",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
}

describe("useZoom", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts with default zoom of 0.5 on desktop", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useZoom());
    expect(result.current.zoom).toBe(0.5);
  });

  it("starts with default zoom of 1 on mobile", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useZoom());
    expect(result.current.zoom).toBe(1);
  });

  it("starts with custom initial zoom", () => {
    const { result } = renderHook(() => useZoom(2));
    expect(result.current.zoom).toBe(2);
  });

  it("falls back to mobile zoom when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);
    const { result } = renderHook(() => useZoom());
    expect(result.current.zoom).toBe(1);
  });

  it("getResponsiveDefaultZoom returns mobile when window is undefined", () => {
    const origWindow = (globalThis as any).window;
    delete (globalThis as any).window;
    try {
      expect(getResponsiveDefaultZoom()).toBe(1);
    } finally {
      (globalThis as any).window = origWindow;
    }
  });

  it("zooms in by step", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useZoom());
    act(() => result.current.zoomIn());
    expect(result.current.zoom).toBe(1.2);
  });

  it("zooms out by step", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useZoom());
    act(() => result.current.zoomOut());
    expect(result.current.zoom).toBe(0.8);
  });

  it("caps at maximum zoom", () => {
    const { result } = renderHook(() => useZoom(2.9));
    act(() => result.current.zoomIn());
    act(() => result.current.zoomIn());
    expect(result.current.zoom).toBe(3);
  });

  it("caps at minimum zoom", () => {
    const { result } = renderHook(() => useZoom(0.6));
    act(() => result.current.zoomOut());
    act(() => result.current.zoomOut());
    expect(result.current.zoom).toBe(0.5);
  });

  it("setZoom sets arbitrary value", () => {
    const { result } = renderHook(() => useZoom());
    act(() => result.current.setZoom(1.75));
    expect(result.current.zoom).toBe(1.75);
  });
});

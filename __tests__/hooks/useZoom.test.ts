import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useZoom } from "src/hooks/useZoom";

describe("useZoom", () => {
  it("starts with default zoom of 1", () => {
    const { result } = renderHook(() => useZoom());
    expect(result.current.zoom).toBe(1);
  });

  it("starts with custom initial zoom", () => {
    const { result } = renderHook(() => useZoom(2));
    expect(result.current.zoom).toBe(2);
  });

  it("zooms in by step", () => {
    const { result } = renderHook(() => useZoom());
    act(() => result.current.zoomIn());
    expect(result.current.zoom).toBe(1.2);
  });

  it("zooms out by step", () => {
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

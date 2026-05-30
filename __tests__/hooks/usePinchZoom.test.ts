import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePinchZoom } from "src/hooks/usePinchZoom";

function createTouch(x: number, y: number) {
  return { clientX: x, clientY: y } as React.Touch;
}

function createTouchList(touches: React.Touch[]) {
  return touches as unknown as React.TouchList;
}

describe("usePinchZoom", () => {
  it("does not call onZoomChange for single touch", () => {
    const onZoomChange = vi.fn();
    const containerRef = { current: document.createElement("div") };
    const { result } = renderHook(() => usePinchZoom(1, onZoomChange, containerRef));

    act(() => {
      result.current.handleTouchStart({
        touches: createTouchList([createTouch(50, 50)]),
      } as React.TouchEvent);
    });

    expect(onZoomChange).not.toHaveBeenCalled();
  });

  it("does not call onZoomChange when onZoomChange is undefined", () => {
    const containerRef = { current: document.createElement("div") };
    const { result } = renderHook(() => usePinchZoom(1, undefined, containerRef));

    act(() => {
      result.current.handleTouchStart({
        touches: createTouchList([createTouch(0, 0), createTouch(100, 0)]),
      } as React.TouchEvent);
    });

    act(() => {
      result.current.handleTouchMove({
        touches: createTouchList([createTouch(0, 0), createTouch(200, 0)]),
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent);
    });
  });

  it("calls onZoomChange on pinch zoom", () => {
    const onZoomChange = vi.fn();
    const containerRef = { current: document.createElement("div") };
    const { result } = renderHook(() => usePinchZoom(1, onZoomChange, containerRef));

    act(() => {
      result.current.handleTouchStart({
        touches: createTouchList([createTouch(0, 0), createTouch(100, 0)]),
      } as React.TouchEvent);
    });

    act(() => {
      result.current.handleTouchMove({
        touches: createTouchList([createTouch(0, 0), createTouch(200, 0)]),
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent);
    });

    expect(onZoomChange).toHaveBeenCalled();
    const lastZoom = onZoomChange.mock.calls[onZoomChange.mock.calls.length - 1][0];
    expect(lastZoom).toBeGreaterThan(1);
    expect(lastZoom).toBeLessThanOrEqual(3);
  });

  it("clears pinch state on touch end", () => {
    const onZoomChange = vi.fn();
    const containerRef = { current: document.createElement("div") };
    const { result } = renderHook(() => usePinchZoom(1, onZoomChange, containerRef));

    act(() => {
      result.current.handleTouchStart({
        touches: createTouchList([createTouch(0, 0), createTouch(100, 0)]),
      } as React.TouchEvent);
    });

    act(() => {
      result.current.handleTouchEnd();
    });

    act(() => {
      result.current.handleTouchMove({
        touches: createTouchList([createTouch(0, 0), createTouch(200, 0)]),
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent);
    });

    expect(onZoomChange).not.toHaveBeenCalled();
  });
});

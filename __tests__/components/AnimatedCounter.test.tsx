import { act, cleanup, render, screen } from "@testing-library/react";
import { AnimatedCounter } from "src/components/AnimatedCounter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("<AnimatedCounter />", () => {
  let observerCallback: (entries: { isIntersecting: boolean }[]) => void;

  beforeEach(() => {
    vi.useFakeTimers();
    window.IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
        observerCallback = cb;
      }
    } as unknown as typeof window.IntersectionObserver;
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders starting at 0", () => {
    render(<AnimatedCounter end={42} />);
    expect(screen.getByText("0")).toBeDefined();
  });

  it("renders suffix at start", () => {
    render(<AnimatedCounter end={100} suffix="%" />);
    expect(screen.getByText("0%")).toBeDefined();
  });

  it("starts counting when visible", () => {
    render(<AnimatedCounter end={42} />);
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    const text = screen.getByText(/^\d+$/).textContent;
    expect(Number(text)).toBeGreaterThan(0);
  });

  it("reaches final value after full duration", () => {
    render(<AnimatedCounter end={42} duration={100} />);
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByText("42")).toBeDefined();
  });

  it("has tabular-nums class", () => {
    const { container } = render(<AnimatedCounter end={10} />);
    const span = container.querySelector("span");
    expect(span?.classList.contains("tabular-nums")).toBe(true);
  });

  it("cleans up interval on unmount without error", () => {
    const { unmount } = render(<AnimatedCounter end={42} />);
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });
    expect(() => unmount()).not.toThrow();
  });

  it("does not count when not visible", () => {
    render(<AnimatedCounter end={42} />);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText("0")).toBeDefined();
  });
});

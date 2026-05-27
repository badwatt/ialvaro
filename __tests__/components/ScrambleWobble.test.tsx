import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ScrambleWobble, triggerRubberBand } from "src/components/ScrambleWobble";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

beforeAll(() => {
  if (!HTMLElement.prototype.animate) {
    HTMLElement.prototype.animate = vi.fn().mockReturnValue({
      onfinish: null,
      finished: Promise.resolve(),
      cancel: vi.fn(),
    });
  }
});

describe("triggerRubberBand", () => {
  it("does nothing when element not in map", () => {
    const elements = new Map<number, HTMLElement>();
    const playing = new Map<number, boolean>();
    const animateSpy = vi.fn();
    triggerRubberBand(0, elements, playing);
    expect(animateSpy).not.toHaveBeenCalled();
  });

  it("does nothing when already playing", () => {
    const el = document.createElement("div");
    const elements = new Map<number, HTMLElement>([[0, el]]);
    const playing = new Map<number, boolean>([[0, true]]);
    const animateSpy = vi.spyOn(el, "animate").mockReturnValue({
      onfinish: null,
      finished: Promise.resolve(),
      cancel: vi.fn(),
    } as unknown as Animation);
    triggerRubberBand(0, elements, playing);
    expect(animateSpy).not.toHaveBeenCalled();
    animateSpy.mockRestore();
  });

  it("plays animation and resets on finish", () => {
    const el = document.createElement("div");
    const elements = new Map<number, HTMLElement>([[0, el]]);
    const playing = new Map<number, boolean>();
    const animateSpy = vi.spyOn(el, "animate").mockImplementation(function (this: HTMLElement) {
      const anim = {
        onfinish: null as (() => void) | null,
        finished: Promise.resolve(),
        cancel: vi.fn(),
      };
      return anim as unknown as Animation;
    });
    triggerRubberBand(0, elements, playing);
    expect(animateSpy).toHaveBeenCalledTimes(1);
    expect(playing.get(0)).toBe(true);
    const returnedAnim = animateSpy.mock.results[0].value;
    if (returnedAnim.onfinish) returnedAnim.onfinish();
    expect(playing.get(0)).toBe(false);
    animateSpy.mockRestore();
  });
});

// Polyfill Web Animations API for happy-dom
beforeAll(() => {
  if (!HTMLElement.prototype.animate) {
    HTMLElement.prototype.animate = vi.fn().mockReturnValue({
      onfinish: null,
      finished: Promise.resolve(),
      cancel: vi.fn(),
    });
  }
});

describe("<ScrambleWobble />", () => {
  afterEach(cleanup);

  it("renders aria-label", () => {
    render(<ScrambleWobble text="HELLO" />);
    expect(screen.getByLabelText("HELLO")).toBeDefined();
  });

  it("starts scrambling then settles", async () => {
    vi.useFakeTimers();
    render(<ScrambleWobble text="ABC" scrambleSpeed={10} />);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    const el = screen.getByLabelText("ABC");
    expect(el.textContent).toBe("ABC");
    vi.useRealTimers();
  });

  it("renders non-breaking space for spaces", async () => {
    vi.useFakeTimers();
    render(<ScrambleWobble text="A B" scrambleSpeed={10} />);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    const el = screen.getByLabelText("A B");
    expect(el.textContent).toContain("\u00A0");
    vi.useRealTimers();
  });

  it("applies custom className", () => {
    render(<ScrambleWobble text="TEST" className="custom" />);
    expect(screen.getByLabelText("TEST").classList.contains("custom")).toBe(true);
  });

  it("plays rubberBand on mouseenter after settled", async () => {
    vi.useFakeTimers();
    const animateMock = vi
      .fn()
      .mockReturnValue({ onfinish: null, finished: Promise.resolve(), cancel: vi.fn() });
    HTMLElement.prototype.animate = animateMock;
    render(<ScrambleWobble text="HI" scrambleSpeed={10} />);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    const el = screen.getByLabelText("HI");
    const spans = el.querySelectorAll("span");
    fireEvent.mouseEnter(spans[0]);
    spans[0].dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    expect(animateMock).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ duration: 800 }),
    );
    vi.useRealTimers();
  });

  it("does not play rubberBand before settled", () => {
    const animateMock = vi
      .fn()
      .mockReturnValue({ onfinish: null, finished: Promise.resolve(), cancel: vi.fn() });
    HTMLElement.prototype.animate = animateMock;
    render(<ScrambleWobble text="HI" scrambleSpeed={40} />);
    const el = screen.getByLabelText("HI");
    const spans = el.querySelectorAll("span");
    fireEvent.mouseEnter(spans[0]);
    expect(animateMock).not.toHaveBeenCalled();
  });

  it("does not retrigger animation while playing", async () => {
    vi.useFakeTimers();
    const animateMock = vi
      .fn()
      .mockReturnValue({ onfinish: null, finished: Promise.resolve(), cancel: vi.fn() });
    HTMLElement.prototype.animate = animateMock;
    render(<ScrambleWobble text="HI" scrambleSpeed={10} />);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    const el = screen.getByLabelText("HI");
    const spans = el.querySelectorAll("span");
    fireEvent.mouseEnter(spans[0]);
    spans[0].dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    expect(animateMock).toHaveBeenCalledTimes(1);
    spans[0].dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    expect(animateMock).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

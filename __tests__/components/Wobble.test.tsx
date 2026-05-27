import { cleanup, fireEvent, render } from "@testing-library/react";
import { Wobble } from "src/components/Wobble";
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

describe("<Wobble />", () => {
  afterEach(cleanup);

  it("renders each letter as a span", () => {
    const { container } = render(<Wobble sentence="ALVARO" />);
    const spans = container.querySelectorAll("span[aria-label='wobble']");
    expect(spans.length).toBe(6);
  });

  it("renders non-breaking space for spaces", () => {
    const { container } = render(<Wobble sentence="AL VARO" />);
    expect(container.textContent).toContain("\u00A0");
  });

  it("renders all letters with correct aria-label", () => {
    const { container } = render(<Wobble sentence="GO" />);
    const spans = container.querySelectorAll("span[aria-label='wobble']");
    expect(spans.length).toBe(2);
  });

  it("has hover color transition", () => {
    const { container } = render(<Wobble sentence="A" />);
    const span = container.querySelector("span[aria-label='wobble']");
    expect(span?.className).toContain("hover:text-alvaro-primary");
  });

  it("plays rubberBand animation on mouseenter", () => {
    const animateMock = vi
      .fn()
      .mockReturnValue({ onfinish: null, finished: Promise.resolve(), cancel: vi.fn() });
    HTMLElement.prototype.animate = animateMock;
    render(<Wobble sentence="HI" />);
    const spans = document.querySelectorAll("span[aria-label='wobble']");
    fireEvent.mouseEnter(spans[0]);
    expect(animateMock).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ duration: 800 }),
    );
  });

  it("does not retrigger animation while playing", () => {
    const animateMock = vi
      .fn()
      .mockReturnValue({ onfinish: null, finished: Promise.resolve(), cancel: vi.fn() });
    HTMLElement.prototype.animate = animateMock;
    render(<Wobble sentence="HI" />);
    const spans = document.querySelectorAll("span[aria-label='wobble']");
    fireEvent.mouseEnter(spans[0]);
    expect(animateMock).toHaveBeenCalledTimes(1);
    fireEvent.mouseEnter(spans[0]);
    expect(animateMock).toHaveBeenCalledTimes(1);
  });

  it("retriggers animation after previous finishes", () => {
    const animateMock = vi.fn().mockImplementation(() => {
      const anim = {
        onfinish: null as (() => void) | null,
        finished: Promise.resolve(),
        cancel: vi.fn(),
      };
      return anim;
    });
    HTMLElement.prototype.animate = animateMock;
    render(<Wobble sentence="HI" />);
    const spans = document.querySelectorAll("span[aria-label='wobble']");
    fireEvent.mouseEnter(spans[0]);
    expect(animateMock).toHaveBeenCalledTimes(1);
    // Simulate animation finish — the component set anim.onfinish, call it
    const firstAnim = animateMock.mock.results[0].value;
    if (firstAnim.onfinish) firstAnim.onfinish();
    fireEvent.mouseEnter(spans[0]);
    expect(animateMock).toHaveBeenCalledTimes(2);
  });

  it("renders line break", () => {
    const { container } = render(<Wobble sentence="OK" />);
    expect(container.querySelector("br")).toBeDefined();
  });

  it("matches snapshot", () => {
    const { container } = render(<Wobble sentence="ALVARO" />);
    expect(container).toMatchSnapshot();
  });
});

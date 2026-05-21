import { act, cleanup, render, screen } from "@testing-library/react";
import { ScrambleWobble } from "src/components/ScrambleWobble";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("<ScrambleWobble />", () => {
  afterEach(cleanup);

  it("renders aria-label", () => {
    render(<ScrambleWobble text="HELLO" />);
    expect(screen.getByLabelText("HELLO")).toBeDefined();
  });

  it("starts scrambling then settles with rubber-band", async () => {
    vi.useFakeTimers();
    render(<ScrambleWobble text="ABC" scrambleSpeed={10} />);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const el = screen.getByLabelText("ABC");
    const spans = el.querySelectorAll("span");

    for (const span of spans) {
      expect(span.className).toContain("rubber-band");
    }

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
});

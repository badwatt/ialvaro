import { cleanup, render, screen } from "@testing-library/react";
import { TextScramble } from "src/components/TextScramble";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("<TextScramble />", () => {
  afterEach(cleanup);

  it("renders final text after animation completes", async () => {
    vi.useFakeTimers();
    render(<TextScramble text="HELLO" scrambleSpeed={10} />);

    // advance timers enough for all iterations
    vi.advanceTimersByTime(500);

    expect(screen.getByText("HELLO")).toBeDefined();
    vi.useRealTimers();
  });

  it("has aria-label with original text", () => {
    render(<TextScramble text="HELLO" />);
    const el = screen.getByLabelText("HELLO");
    expect(el.getAttribute("aria-label")).toBe("HELLO");
  });

  it("applies custom className", () => {
    render(<TextScramble text="TEST" className="custom-class" />);
    const el = screen.getByLabelText("TEST");
    expect(el.classList.contains("custom-class")).toBe(true);
  });

  it("preserves spaces in scramble", async () => {
    vi.useFakeTimers();
    render(<TextScramble text="HI THERE" scrambleSpeed={10} />);
    vi.advanceTimersByTime(500);
    expect(screen.getByText("HI THERE")).toBeDefined();
    vi.useRealTimers();
  });
});

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { LoadingScreen } from "src/components/LoadingScreen";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("<LoadingScreen />", () => {
  afterEach(() => {
    sessionStorage.clear();
    cleanup();
  });

  it("renders brand text", () => {
    render(<LoadingScreen />);
    expect(screen.getByText("AM")).toBeDefined();
  });

  it("has correct z-index for overlay", () => {
    const { container } = render(<LoadingScreen />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("z-[100]");
  });

  it("hides immediately when sessionStorage has visited flag", () => {
    sessionStorage.setItem("ialvaro-visited", "true");
    const { container } = render(<LoadingScreen />);
    expect(container.firstChild).toBeNull();
  });

  it("triggers exit animation then hides after timers", () => {
    vi.useFakeTimers();
    const { container } = render(<LoadingScreen />);
    expect(screen.getByLabelText("loading-screen")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(1900);
    });
    expect(screen.getByLabelText("loading-screen").className).toContain("opacity-0");

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(container.querySelector("[aria-label='loading-screen']")).toBeNull();
    vi.useRealTimers();
  });

  it("skips and hides after click", () => {
    vi.useFakeTimers();
    const { container } = render(<LoadingScreen />);

    fireEvent.click(screen.getByLabelText("loading-screen"));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(container.querySelector("[aria-label='loading-screen']")).toBeNull();
    vi.useRealTimers();
  });
});

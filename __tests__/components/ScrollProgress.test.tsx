import { act, cleanup, render, screen } from "@testing-library/react";
import { ScrollProgress } from "src/components/ScrollProgress";
import { afterEach, describe, expect, it } from "vitest";

describe("<ScrollProgress />", () => {
  afterEach(cleanup);

  it("renders progress bar starting at 0%", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 2000,
      configurable: true,
    });
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true, writable: true });

    render(<ScrollProgress />);
    const bar = screen.getByLabelText("scroll-progress");
    expect(bar.style.width).toBe("0%");
  });

  it("updates width on scroll", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 2000,
      configurable: true,
    });
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });

    render(<ScrollProgress />);

    Object.defineProperty(window, "scrollY", { value: 600, configurable: true, writable: true });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    const bar = screen.getByLabelText("scroll-progress");
    expect(bar.style.width).toBe("50%");
  });

  it("sets 0% when docHeight is zero", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    Object.defineProperty(window, "scrollY", { value: 100, configurable: true, writable: true });

    render(<ScrollProgress />);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    const bar = screen.getByLabelText("scroll-progress");
    expect(bar.style.width).toBe("0%");
  });

  it("has gradient class", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 2000,
      configurable: true,
    });
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });

    render(<ScrollProgress />);
    const bar = screen.getByLabelText("scroll-progress");
    expect(bar.className).toContain("bg-gradient-to-r");
  });
});

import { act, cleanup, render, screen } from "@testing-library/react";
import { WordReveal } from "src/components/WordReveal";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createObserverMock } from "../helpers/observerMock";

describe("<WordReveal />", () => {
  let observer: ReturnType<typeof createObserverMock>;

  beforeEach(() => {
    observer = createObserverMock();
  });
  afterEach(cleanup);

  it("renders words", () => {
    render(<WordReveal text="Hello world" />);
    expect(screen.getByText(/Hello/)).toBeDefined();
  });

  it("words start hidden", () => {
    const { container } = render(<WordReveal text="Hello world" />);
    const spans = container.querySelectorAll("span");
    expect(spans[0].className).toContain("opacity-0");
  });

  it("words become visible when intersecting", () => {
    const { container } = render(<WordReveal text="Hello world" />);
    act(() => {
      observer.callback([{ isIntersecting: true }]);
    });
    expect(container.querySelector("span")!.className).toContain("opacity-100");
  });

  it("applies custom className", () => {
    render(<WordReveal text="Test" className="my-class" />);
    expect(screen.getByText(/Test/).closest("p")?.classList.contains("my-class")).toBe(true);
  });
});

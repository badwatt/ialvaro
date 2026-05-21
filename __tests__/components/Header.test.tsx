import { act, cleanup, render, screen } from "@testing-library/react";
import { Header } from "src/components/Header";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createObserverMock } from "../helpers/observerMock";

describe("<Header />", () => {
  let observer: ReturnType<typeof createObserverMock>;

  beforeEach(() => {
    observer = createObserverMock();
  });
  afterEach(cleanup);

  it("renders the title", () => {
    render(<Header title="Portfolio" />);
    expect(screen.getByText("Portfolio")).toBeDefined();
  });

  it("applies initial hidden classes", () => {
    const { container } = render(<Header title="About" />);
    const h1 = container.querySelector("h1");
    expect(h1?.className).toContain("opacity-0");
  });

  it("becomes visible when intersecting", () => {
    const { container } = render(<Header title="Experience" />);
    act(() => {
      observer.callback([{ isIntersecting: true }]);
    });
    expect(container.querySelector("h1")!.className).toContain("opacity-100");
    expect(container.querySelector(".bg-alvaro-primary")!.className).toContain("w-24");
  });

  it("matches snapshot", () => {
    const { container } = render(<Header title="About" />);
    expect(container).toMatchSnapshot();
  });
});

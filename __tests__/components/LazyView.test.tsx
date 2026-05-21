import { act, cleanup, render, screen } from "@testing-library/react";
import { LazyView } from "src/components/LazyView";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createObserverMock } from "../helpers/observerMock";

describe("<LazyView />", () => {
  let observer: ReturnType<typeof createObserverMock>;

  beforeEach(() => {
    observer = createObserverMock();
  });
  afterEach(cleanup);

  it("renders children", () => {
    render(
      <LazyView>
        <p>Lazy content</p>
      </LazyView>,
    );
    expect(screen.getByText("Lazy content")).toBeDefined();
  });

  it("applies initial hidden classes", () => {
    const { container } = render(
      <LazyView>
        <p>Content</p>
      </LazyView>,
    );
    expect((container.firstChild as HTMLElement).className).toContain("opacity-0");
  });

  it("becomes visible when intersecting", () => {
    const { container } = render(
      <LazyView>
        <p>Content</p>
      </LazyView>,
    );
    act(() => {
      observer.callback([{ isIntersecting: true }]);
    });
    expect((container.firstChild as HTMLElement).className).toContain("opacity-100");
  });

  it("accepts once=false", () => {
    render(
      <LazyView once={false}>
        <p>Content</p>
      </LazyView>,
    );
    expect(screen.getByText("Content")).toBeDefined();
  });
});

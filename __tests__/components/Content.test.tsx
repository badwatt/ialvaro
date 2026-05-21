import { act, cleanup, render, screen } from "@testing-library/react";
import { Content } from "src/components/Content";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createObserverMock } from "../helpers/observerMock";

describe("<Content />", () => {
  let observer: ReturnType<typeof createObserverMock>;

  beforeEach(() => {
    observer = createObserverMock();
  });
  afterEach(cleanup);

  it("renders children", () => {
    render(
      <Content>
        <p>Section content</p>
      </Content>,
    );
    expect(screen.getByText("Section content")).toBeDefined();
  });

  it("renders as section element", () => {
    const { container } = render(
      <Content>
        <p>Content</p>
      </Content>,
    );
    expect(container.querySelector("section")).toBeDefined();
  });

  it("applies initial hidden classes", () => {
    const { container } = render(
      <Content>
        <p>Content</p>
      </Content>,
    );
    const section = container.querySelector("section");
    expect(section?.className).toContain("opacity-0");
  });

  it("becomes visible when intersecting", () => {
    const { container } = render(
      <Content>
        <p>Content</p>
      </Content>,
    );
    act(() => {
      observer.callback([{ isIntersecting: true }]);
    });
    expect(container.querySelector("section")!.className).toContain("opacity-100");
  });
});

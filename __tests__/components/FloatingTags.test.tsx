import { act, cleanup, render, screen } from "@testing-library/react";
import { FloatingTags } from "src/components/FloatingTags";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("<FloatingTags />", () => {
  let observerCallback: (entries: { isIntersecting: boolean }[]) => void;

  beforeEach(() => {
    window.IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
        observerCallback = cb;
      }
    } as unknown as typeof window.IntersectionObserver;
  });
  afterEach(cleanup);

  it("renders all tags", () => {
    render(<FloatingTags tags={["React", "TypeScript", "Node"]} />);
    expect(screen.getByText("React")).toBeDefined();
    expect(screen.getByText("TypeScript")).toBeDefined();
    expect(screen.getByText("Node")).toBeDefined();
  });

  it("renders empty tags gracefully", () => {
    const { container } = render(<FloatingTags tags={[]} />);
    expect(container.firstChild).toBeDefined();
  });

  it("tags become visible when intersecting", () => {
    render(<FloatingTags tags={["React"]} />);
    expect(screen.getByText("React").className).toContain("opacity-0");

    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });
    expect(screen.getByText("React").className).toContain("opacity-100");
  });
});

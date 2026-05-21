import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SpotlightCard } from "src/components/SpotlightCard";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("<SpotlightCard />", () => {
  afterEach(cleanup);

  it("renders children", () => {
    render(
      <SpotlightCard>
        <p>Card content</p>
      </SpotlightCard>,
    );
    expect(screen.getByText("Card content")).toBeDefined();
  });

  it("updates CSS variables on mousemove", () => {
    const { container } = render(
      <SpotlightCard style={{ width: "400px", height: "300px" }}>
        <p>Content</p>
      </SpotlightCard>,
    );
    const card = container.firstChild as HTMLElement;
    vi.spyOn(card, "getBoundingClientRect").mockReturnValue({
      left: 100,
      top: 50,
      width: 400,
      height: 300,
    } as DOMRect);
    fireEvent.mouseMove(card, { clientX: 300, clientY: 200 });
    expect(card.style.getPropertyValue("--mouse-x")).toBe("200px");
  });

  it("cleans up listener on unmount", () => {
    const { container, unmount } = render(
      <SpotlightCard>
        <p>Content</p>
      </SpotlightCard>,
    );
    const card = container.firstChild as HTMLElement;
    const removeSpy = vi.spyOn(card, "removeEventListener");
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
  });
});

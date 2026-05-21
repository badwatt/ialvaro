import { cleanup, render, screen } from "@testing-library/react";
import { CursorGlow } from "src/components/CursorGlow";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("<CursorGlow />", () => {
  afterEach(cleanup);

  it("renders a glow element", () => {
    const { container } = render(<CursorGlow />);
    expect(container.firstChild).toBeDefined();
  });

  it("has aria-hidden for decorative element", () => {
    render(<CursorGlow />);
    const glow = screen.getByLabelText("cursor-glow");
    expect(glow.getAttribute("aria-hidden")).toBe("true");
  });

  it("updates position on mousemove with RAF", () => {
    const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 1;
    });
    render(<CursorGlow />);
    const glow = screen.getByLabelText("cursor-glow");
    window.dispatchEvent(new MouseEvent("mousemove", { clientX: 500, clientY: 600 }));
    expect(glow.style.transform).toBe("translate(250px, 350px)");
    rafSpy.mockRestore();
  });

  it("cleans up listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<CursorGlow />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
  });
});

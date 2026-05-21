import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { goToTop, Scrollup } from "src/components/Scrollup";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("<Scrollup />", () => {
  beforeEach(() => {
    render(<Scrollup />);
  });
  afterEach(cleanup);

  it("should appear if scrollY > 400", () => {
    expect(screen.queryByLabelText("Scroll to top")).toBeNull();
    fireEvent.scroll(window, { target: { scrollY: 401 } });
    expect(screen.queryByLabelText("Scroll to top")).not.toBeNull();
  });

  it("should NOT appear if scrollY < 400", () => {
    fireEvent.scroll(window, { target: { scrollY: 399 } });
    expect(screen.queryByLabelText("Scroll to top")).toBeNull();
  });

  it("should scroll to top when clicked", () => {
    const scrollToSpy = vi.spyOn(document.documentElement, "scrollTo").mockImplementation(() => {});
    fireEvent.scroll(window, { target: { scrollY: 401 } });
    goToTop();
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    scrollToSpy.mockRestore();
  });
});

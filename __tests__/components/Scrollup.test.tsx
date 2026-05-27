import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Scrollup } from "src/components/Scrollup";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("<Scrollup />", () => {
  afterEach(cleanup);

  it("should appear if scrollY > 400", () => {
    render(<Scrollup />);
    expect(screen.queryByLabelText("Scroll to top")).toBeNull();
    fireEvent.scroll(window, { target: { scrollY: 401 } });
    expect(screen.queryByLabelText("Scroll to top")).not.toBeNull();
  });

  it("should NOT appear if scrollY < 400", () => {
    render(<Scrollup />);
    fireEvent.scroll(window, { target: { scrollY: 399 } });
    expect(screen.queryByLabelText("Scroll to top")).toBeNull();
  });

  it("clicks button and scrolls to top", () => {
    const scrollToSpy = vi.spyOn(document.documentElement, "scrollTo").mockImplementation(() => {});
    render(<Scrollup />);
    fireEvent.scroll(window, { target: { scrollY: 401 } });
    const btn = screen.getByLabelText("Scroll to top");
    fireEvent.click(btn);
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    scrollToSpy.mockRestore();
  });
});

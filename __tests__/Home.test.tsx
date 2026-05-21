import { act, cleanup, render, screen } from "@testing-library/react";
import { Home } from "src/views/Home";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createObserverMock } from "./helpers/observerMock";

describe("<Home />", () => {
  let observer: ReturnType<typeof createObserverMock>;

  beforeEach(() => {
    observer = createObserverMock();
  });
  afterEach(cleanup);

  it("should render hero name with scramble wobble", async () => {
    render(<Home />);
    expect(screen.getByLabelText("ALVARO")).toBeDefined();
    expect(screen.getByLabelText("GARCIA")).toBeDefined();
    expect(screen.getByLabelText("MACIAS")).toBeDefined();
  });

  it("should render CTAs", () => {
    render(<Home />);
    expect(screen.getByText("View work")).toBeDefined();
    expect(screen.getByText("CV")).toBeDefined();
  });

  it("should render tagline", () => {
    render(<Home />);
    expect(screen.getByText("Full Stack Developer")).toBeDefined();
    expect(screen.getByText(/Building interfaces that move/i)).toBeDefined();
  });

  it("updates parallax on scroll", () => {
    render(<Home />);
    vi.spyOn(window, "scrollY", "get").mockReturnValue(500);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(screen.getByAltText("Alvaro Garcia Macias").style.transform).toContain(
      "translateY(60px)",
    );
  });

  it("reveals tagline when visible", () => {
    render(<Home />);
    const tagline = screen.getByText(/Building interfaces that move/i).closest("p");
    expect(tagline?.className).toContain("opacity-0");

    act(() => {
      observer.callback([{ isIntersecting: true }]);
    });
    expect(tagline?.className).toContain("opacity-100");
  });

  it("matches snapshot", () => {
    const { container } = render(<Home />);
    expect(container).toMatchSnapshot();
  });
});

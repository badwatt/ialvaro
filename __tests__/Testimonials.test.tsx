import { act, cleanup, render, screen } from "@testing-library/react";
import { Testimonials } from "src/views/Testimonials";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createObserverMock } from "./helpers/observerMock";

describe("<Testimonials />", () => {
  let observer: ReturnType<typeof createObserverMock>;

  beforeEach(() => {
    observer = createObserverMock();
  });
  afterEach(cleanup);

  it("should render all testimonial quotes", () => {
    render(<Testimonials />);
    expect(screen.getByText(/exceptional technical depth/i)).toBeDefined();
    expect(screen.getByText(/most reliable developers/i)).toBeDefined();
    expect(screen.getByText(/clean code/i)).toBeDefined();
  });

  it("should render all names and avatars", () => {
    render(<Testimonials />);
    expect(screen.getByText(/María Fernández/i)).toBeDefined();
    expect(screen.getByAltText("María Fernández")).toBeDefined();
  });

  it("cards start hidden and reveal when intersecting", () => {
    render(<Testimonials />);
    const card = screen.getByText(/Fernández/i).closest(".spotlight-card");
    expect(card?.className).toContain("opacity-0");

    act(() => {
      observer.callback([{ isIntersecting: true }]);
    });
    expect(card?.className).toContain("opacity-100");
  });

  it("matches snapshot", () => {
    const { container } = render(<Testimonials />);
    expect(container).toMatchSnapshot();
  });
});

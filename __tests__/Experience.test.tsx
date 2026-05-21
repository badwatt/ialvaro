import { cleanup, render, screen } from "@testing-library/react";
import { Experience } from "src/views/Experience";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mockIntersectionObserver } from "./mocks/IntersectionObserver.tsx";

describe("<Experience />", () => {
  beforeEach(() => {
    mockIntersectionObserver();
  });
  afterEach(cleanup);

  it("should match the snapshot", () => {
    const { container } = render(<Experience />);
    expect(container).toMatchSnapshot();
  });

  it("should render a heading", () => {
    render(<Experience />);
    expect(screen.getByRole("heading", { name: /experience/i })).toBeDefined();
  });

  it("should render accordion items", () => {
    render(<Experience />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("should auto-open the most recent experience", () => {
    render(<Experience />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0].getAttribute("aria-expanded")).toBe("true");
  });

  it("should render experience images", () => {
    render(<Experience />);
    expect(screen.getAllByRole("img").length).toBeGreaterThanOrEqual(1);
  });
});

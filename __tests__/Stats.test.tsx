import { cleanup, render, screen } from "@testing-library/react";
import { Stats } from "src/views/Stats";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mockIntersectionObserver } from "./mocks/IntersectionObserver.tsx";

describe("<Stats />", () => {
  beforeEach(() => {
    mockIntersectionObserver();
    render(<Stats />);
  });
  afterEach(cleanup);

  it("should match the snapshot", () => {
    const { container } = render(<Stats />);
    expect(container).toMatchSnapshot();
  });

  it("should render all stat labels", () => {
    expect(screen.getByText(/years experience/i)).toBeDefined();
    expect(screen.getByText(/projects delivered/i)).toBeDefined();
    expect(screen.getByText("Technologies")).toBeDefined();
    expect(screen.getByText("Commitment")).toBeDefined();
  });

  it("counters start at 0", () => {
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(1);
  });
});

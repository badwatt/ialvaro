import { cleanup, render, screen } from "@testing-library/react";
import { Experience } from "src/views/Experience";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mockIntersectionObserver } from "../mocks/IntersectionObserver.tsx";
import { testExperienceData } from "../fixtures";

describe("<Experience />", () => {
  beforeEach(() => {
    mockIntersectionObserver();
  });
  afterEach(cleanup);

  it("should match the snapshot", () => {
    const { container } = render(<Experience experienceData={testExperienceData} />);
    expect(container).toMatchSnapshot();
  });

  it("should render a heading", () => {
    render(<Experience experienceData={testExperienceData} />);
    expect(screen.getByRole("heading", { name: /experience/i })).toBeDefined();
  });

  it("should render accordion items", () => {
    render(<Experience experienceData={testExperienceData} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("should auto-open the most recent experience", () => {
    render(<Experience experienceData={testExperienceData} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0].getAttribute("aria-expanded")).toBe("true");
  });

  it("should render experience images", () => {
    render(<Experience experienceData={testExperienceData} />);
    expect(screen.getAllByRole("img").length).toBeGreaterThanOrEqual(1);
  });
});

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

  it("renders a nested accordion when the description contains `---` separators", () => {
    const split = {
      ...testExperienceData[0],
      description: "# Period 1\n\nfirst body\n\n---\n\n# Period 2\n\nsecond body",
    };
    render(<Experience experienceData={[split]} />);
    // Two sub-accordion buttons inside the parent (Period 1, Period 2).
    const buttons = screen.getAllByRole("button");
    const period1 = buttons.find((b) => b.textContent?.includes("Period 1"));
    const period2 = buttons.find((b) => b.textContent?.includes("Period 2"));
    expect(period1).toBeDefined();
    expect(period2).toBeDefined();
  });

  it("renders the description directly when there is no `---`", () => {
    render(<Experience experienceData={testExperienceData} />);
    // Only the parent accordion buttons exist (no Period sub-buttons).
    const buttons = screen.getAllByRole("button");
    const periodButton = buttons.find((b) => b.textContent?.includes("Period "));
    expect(periodButton).toBeUndefined();
  });
});

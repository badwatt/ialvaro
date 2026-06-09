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

  it("renders sub-periods as accordion items with the first `#` heading as title", () => {
    // Openbank-style content: two periods separated by `---`. Each period
    // becomes a sub-accordion item; the title is the first `#` heading in
    // that period, the subtitle is the first blockquote (e.g. duration).
    // The first period is expanded by default; the second is collapsed.
    const split = {
      ...testExperienceData[0],
      description:
        "# Consulting Firm:\n\n- PLEXUS\n\n> 1 year 3 months\n\n---\n\n# Consulting Firm:\n\n- Knowmad Mood",
    };
    render(<Experience experienceData={[split]} />);
    // No "Period N" labels are rendered. Titles come from the first
    // `#` heading.
    const buttons = screen.getAllByRole("button");
    const periodButton = buttons.find((b) => b.textContent?.includes("Period "));
    expect(periodButton).toBeUndefined();
    // Both periods are accordion items labelled with the first `#` heading
    // text. The text appears twice: once in the accordion title and once
    // in the body. Use the title to identify the buttons.
    const headingButtons = buttons.filter((b) => b.textContent?.includes("Consulting Firm:"));
    // Two periods -> two buttons with the same first heading text.
    expect(headingButtons.length).toBeGreaterThanOrEqual(2);
    // The first period button is expanded; the second is collapsed.
    expect(headingButtons[0].getAttribute("aria-expanded")).toBe("true");
    expect(headingButtons[1].getAttribute("aria-expanded")).toBe("false");
    // Subtitle (blockquote) is on the first period button.
    expect(headingButtons[0].textContent).toContain("1 year 3 months");
    // Both periods' content is in the DOM.
    expect(screen.getByText("PLEXUS")).toBeDefined();
    expect(screen.getByText("Knowmad Mood")).toBeDefined();
    // The accordion title (first `#` heading) appears once per period
    // (in the accordion header, stripped from the body). Two periods
    // -> two occurrences in the DOM, none inside the body content.
    expect(screen.getAllByText("Consulting Firm:").length).toBe(2);
    // The blockquote subtitle is also stripped from the body.
    expect(screen.getAllByText("1 year 3 months").length).toBe(1);
  });

  it("renders the description directly when there is no `---`", () => {
    render(<Experience experienceData={testExperienceData} />);
    // No nested accordion buttons exist when there is no subgroup split.
    const buttons = screen.getAllByRole("button");
    const periodButton = buttons.find((b) => b.textContent?.includes("Period "));
    expect(periodButton).toBeUndefined();
  });
});

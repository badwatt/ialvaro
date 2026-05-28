import { cleanup, render, screen } from "@testing-library/react";
import { Stats } from "src/views/Stats";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mockIntersectionObserver } from "./mocks/IntersectionObserver.tsx";
import { testExperienceData, testPortfolioData } from "./fixtures";

describe("<Stats />", () => {
  beforeEach(() => {
    mockIntersectionObserver();
  });
  afterEach(cleanup);

  it("should match the snapshot", () => {
    const { container } = render(
      <Stats experienceData={testExperienceData} portfolioData={testPortfolioData} />,
    );
    expect(container).toMatchSnapshot();
  });

  it("should render all stat labels", () => {
    render(
      <Stats experienceData={testExperienceData} portfolioData={testPortfolioData} />,
    );
    expect(screen.getByText(/years experience/i)).toBeDefined();
    expect(screen.getByText(/projects delivered/i)).toBeDefined();
    expect(screen.getByText("Technologies")).toBeDefined();
    expect(screen.getByText("Commitment")).toBeDefined();
  });

  it("counters start at 0", () => {
    render(
      <Stats experienceData={testExperienceData} portfolioData={testPortfolioData} />,
    );
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(1);
  });
});

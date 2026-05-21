import { cleanup, render, screen } from "@testing-library/react";
import { Portfolio } from "src/views/Portfolio";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mockIntersectionObserver } from "./mocks/IntersectionObserver.tsx";

describe("<Portfolio />", () => {
  beforeEach(() => {
    mockIntersectionObserver();
  });
  afterEach(cleanup);

  it("renders section with correct id", () => {
    const { container } = render(<Portfolio />);
    expect(container.querySelector("#portfolio")).toBeDefined();
  });

  it("renders portfolio items from data", () => {
    render(<Portfolio />);
    expect(screen.getByText("ialvaro")).toBeDefined();
    expect(screen.getByText("wrestic")).toBeDefined();
  });

  it("renders descriptions", () => {
    render(<Portfolio />);
    expect(
      screen.getByText(/TypeScript, React.js, Astro.js, Tailwind & Framer Motion/i),
    ).toBeDefined();
    expect(screen.getByText(/backup tool built in Rust/i)).toBeDefined();
  });

  it("renders View project links", () => {
    render(<Portfolio />);
    const links = screen.getAllByText("View project");
    expect(links.length).toBe(2);
  });

  it("renders images with correct src", () => {
    render(<Portfolio />);
    const img1 = screen.getByAltText("ialvaro") as HTMLImageElement;
    const img2 = screen.getByAltText("wrestic") as HTMLImageElement;
    expect(img1.getAttribute("src")).toBe("images/readme/ialvaro.png");
    expect(img2.getAttribute("src")).toBe("portfolio/wrestic/wrestic_mockup.png");
  });

  it("renders external links with correct attributes", () => {
    render(<Portfolio />);
    const githubLink = screen.getByLabelText("ialvaro");
    expect(githubLink.getAttribute("href")).toBe("https://github.com/alvaro17f/ialvaro");
    expect(githubLink.getAttribute("target")).toBe("_blank");

    const wresticLink = screen.getByLabelText("wrestic");
    expect(wresticLink.getAttribute("href")).toBe("https://github.com/alvaro17f/wrestic");
  });

  it("renders header title", () => {
    render(<Portfolio />);
    expect(screen.getByText("Portfolio")).toBeDefined();
  });

  it("matches snapshot", () => {
    const { container } = render(<Portfolio />);
    expect(container).toMatchSnapshot();
  });
});

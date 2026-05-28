import { cleanup, render, screen } from "@testing-library/react";
import { CVPreviewContent } from "src/components/CVPreviewContent";
import { afterEach, describe, expect, it } from "vitest";

describe("<CVPreviewContent />", () => {
  afterEach(cleanup);

  it("renders name and role", () => {
    render(<CVPreviewContent domain="test.dev" />);
    expect(screen.getByText("Alvaro Garcia Macias")).toBeDefined();
    expect(screen.getByText("Full Stack Developer")).toBeDefined();
  });

  it("renders contact links", () => {
    render(<CVPreviewContent domain="test.dev" />);
    expect(screen.getByText("github.com/badwatt")).toBeDefined();
    expect(screen.getByText("linkedin.com/in/alvaro-garcia-macias")).toBeDefined();
  });

  it("renders profile image", () => {
    render(<CVPreviewContent domain="test.dev" />);
    expect(screen.getByAltText("Alvaro Garcia Macias")).toBeDefined();
  });

  it("renders about section", () => {
    render(<CVPreviewContent domain="test.dev" />);
    expect(screen.getByText("About")).toBeDefined();
  });

  it("renders skills section with featured tags", () => {
    render(<CVPreviewContent domain="test.dev" />);
    expect(screen.getAllByText("Skills").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("react.js")).toBeDefined();
    expect(screen.getByText("typescript")).toBeDefined();
  });

  it("renders experience section", () => {
    render(<CVPreviewContent domain="test.dev" />);
    expect(screen.getByText("Experience")).toBeDefined();
    expect(screen.getByText("Openbank")).toBeDefined();
    expect(screen.getByText("RSI")).toBeDefined();
  });

  it("renders footer with domain", () => {
    render(<CVPreviewContent domain="test.dev" />);
    expect(screen.getByText(/Generated from test\.dev/)).toBeDefined();
  });

  it("renders footer year", () => {
    render(<CVPreviewContent domain="test.dev" />);
    expect(screen.getByText(String(new Date().getFullYear()))).toBeDefined();
  });

  it("renders footer profile image", () => {
    const { container } = render(<CVPreviewContent domain="test.dev" />);
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBeGreaterThanOrEqual(2);
  });
});
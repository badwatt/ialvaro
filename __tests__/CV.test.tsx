import { cleanup, render, screen } from "@testing-library/react";
import { CV } from "src/views/CV";
import { afterEach, describe, expect, it } from "vitest";

describe("<CV />", () => {
  afterEach(cleanup);

  it("renders download heading", () => {
    render(<CV />);
    expect(screen.getByText("Download my CV")).toBeDefined();
  });

  it("renders section with correct id", () => {
    const { container } = render(<CV />);
    expect(container.querySelector("#cv")).toBeDefined();
  });

  it("renders link to cv PDF", () => {
    render(<CV />);
    const link = screen.getByLabelText("Download CV");
    expect(link.getAttribute("href")).toBe("/cv/cv.pdf");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("renders download icon", () => {
    const { container } = render(<CV />);
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("matches snapshot", () => {
    const { container } = render(<CV />);
    expect(container).toMatchSnapshot();
  });
});

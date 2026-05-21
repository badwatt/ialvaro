import { cleanup, render, screen } from "@testing-library/react";
import { Footer } from "src/components/Footer";
import { afterEach, describe, expect, it } from "vitest";

describe("<Footer />", () => {
  afterEach(cleanup);

  it("renders brand heading", () => {
    render(<Footer />);
    expect(screen.getByText("Alvaro Garcia Macias")).toBeDefined();
  });

  it("renders tagline", () => {
    render(<Footer />);
    expect(screen.getByText(/Full Stack Developer building interfaces that move/i)).toBeDefined();
  });

  it("renders navigation section", () => {
    render(<Footer />);
    expect(screen.getByText("Navigation")).toBeDefined();
  });

  it("renders all nav links", () => {
    render(<Footer />);
    const links = ["Home", "About", "Skills", "Experience", "Portfolio", "Contact"];
    for (const label of links) {
      expect(screen.getByText(label)).toBeDefined();
    }
  });

  it("renders nav links with correct hrefs", () => {
    render(<Footer />);
    expect(screen.getByText("Home").closest("a")?.getAttribute("href")).toBe("#home");
    expect(screen.getByText("About").closest("a")?.getAttribute("href")).toBe("#about");
    expect(screen.getByText("Skills").closest("a")?.getAttribute("href")).toBe("#skills");
    expect(screen.getByText("Experience").closest("a")?.getAttribute("href")).toBe("#experience");
    expect(screen.getByText("Portfolio").closest("a")?.getAttribute("href")).toBe("#portfolio");
    expect(screen.getByText("Contact").closest("a")?.getAttribute("href")).toBe("#contact");
  });

  it("renders connect section", () => {
    render(<Footer />);
    expect(screen.getByText("Connect")).toBeDefined();
  });

  it("renders GitHub link", () => {
    render(<Footer />);
    const ghLink = screen.getByText("GitHub");
    expect(ghLink.closest("a")?.getAttribute("href")).toBe("https://github.com/alvaro17f");
    expect(ghLink.closest("a")?.getAttribute("target")).toBe("_blank");
    expect(ghLink.closest("a")?.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("renders LinkedIn link", () => {
    render(<Footer />);
    const liLink = screen.getByText("LinkedIn");
    expect(liLink.closest("a")?.getAttribute("href")).toBe(
      "https://linkedin.com/in/alvarogarciamacias",
    );
    expect(liLink.closest("a")?.getAttribute("target")).toBe("_blank");
    expect(liLink.closest("a")?.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("renders as footer element", () => {
    const { container } = render(<Footer />);
    expect(container.querySelector("footer")).toBeDefined();
  });

  it("matches snapshot", () => {
    const { container } = render(<Footer />);
    expect(container).toMatchSnapshot();
  });
});

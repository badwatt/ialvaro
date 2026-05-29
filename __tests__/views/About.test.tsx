import { act, cleanup, render, screen } from "@testing-library/react";
import { About } from "src/views/About";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createObserverMock } from "../helpers/observerMock";
import { testAboutData } from "../fixtures";

describe("<About />", () => {
  let observer: ReturnType<typeof createObserverMock>;

  beforeEach(() => {
    observer = createObserverMock();
  });
  afterEach(cleanup);

  it("should render about label", () => {
    render(<About aboutData={testAboutData} />);
    expect(screen.getByText("About me")).toBeDefined();
  });

  it("should render headline", () => {
    render(<About aboutData={testAboutData} />);
    expect(screen.getByText(/I build/i)).toBeDefined();
  });

  it("should render profile image", () => {
    render(<About aboutData={testAboutData} />);
    expect(screen.getByAltText("Alvaro Garcia Macias")).toBeDefined();
  });

  it("should render description paragraphs", () => {
    render(<About aboutData={testAboutData} />);
    expect(screen.getByText(/100% involved/i)).toBeDefined();
    expect(screen.getByText(/non-conformist/i)).toBeDefined();
  });

  it("should render languages", () => {
    render(<About aboutData={testAboutData} />);
    expect(screen.getByText("Spanish")).toBeDefined();
    expect(screen.getByText("English")).toBeDefined();
  });

  it("should render education", () => {
    render(<About aboutData={testAboutData} />);
    expect(screen.getByText("Bachelor in Computer Science")).toBeDefined();
    expect(screen.getByText(/Universidad Complutense de Madrid/)).toBeDefined();
  });

  it("reveals profile image when intersecting", () => {
    render(<About aboutData={testAboutData} />);
    const img = screen.getByAltText("Alvaro Garcia Macias");
    expect(img.className).toContain("opacity-0");

    act(() => {
      observer.callback([{ isIntersecting: true }]);
    });
    expect(img.className).toContain("opacity-100");
  });

  it("matches snapshot", () => {
    const { container } = render(<About aboutData={testAboutData} />);
    expect(container).toMatchSnapshot();
  });
});

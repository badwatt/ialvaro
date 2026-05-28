import { act, cleanup, render, screen } from "@testing-library/react";
import { Home } from "src/views/Home";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createObserverMock } from "./helpers/observerMock";

vi.mock("@react-pdf/renderer", async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    pdf: vi.fn().mockReturnValue({
      toBlob: vi.fn().mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" })),
    }),
  };
});

describe("<Home />", () => {
  let observer: ReturnType<typeof createObserverMock>;

  beforeEach(() => {
    observer = createObserverMock();
  });
  afterEach(cleanup);

  it("should render hero name with scramble wobble", async () => {
    render(<Home />);
    expect(screen.getByLabelText("ALVARO")).toBeDefined();
    expect(screen.getByLabelText("GARCIA")).toBeDefined();
    expect(screen.getByLabelText("MACIAS")).toBeDefined();
  });

  it("should render CTAs", () => {
    render(<Home />);
    expect(screen.getByText("View work")).toBeDefined();
    expect(screen.getByText("CV")).toBeDefined();
  });

  it("should render tagline", () => {
    render(<Home />);
    expect(screen.getByText("Full Stack Developer")).toBeDefined();
    expect(screen.getByText(/Building interfaces that move/i)).toBeDefined();
  });

  it("updates parallax on scroll", () => {
    render(<Home />);
    vi.spyOn(window, "scrollY", "get").mockReturnValue(500);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(screen.getByAltText("Alvaro Garcia Macias").style.transform).toContain(
      "translateY(60px)",
    );
  });

  it("reveals tagline when visible", () => {
    render(<Home />);
    const tagline = screen.getByText(/Building interfaces that move/i).closest("p");
    expect(tagline?.className).toContain("opacity-0");

    act(() => {
      observer.callback([{ isIntersecting: true }]);
    });
    expect(tagline?.className).toContain("opacity-100");
  });

  it("matches snapshot", () => {
    const { container } = render(<Home />);
    expect(container).toMatchSnapshot();
  });

  it("generates and opens CV in new tab on button click", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<Home />);
    const btn = screen.getByText("CV");
    expect(btn.tagName.toLowerCase()).toBe("button");
    btn.click();
    await screen.findByText("Generating...");
    await screen.findByText("CV");
    expect(openSpy).toHaveBeenCalledWith(expect.stringContaining("blob:"), "_blank");
    openSpy.mockRestore();
  });

  it("handles CV generation failure gracefully", async () => {
    const { pdf } = await import("@react-pdf/renderer");
    vi.mocked(pdf).mockReturnValueOnce({
      toBlob: vi.fn().mockRejectedValue(new Error("PDF fail")),
    } as unknown as ReturnType<typeof pdf>);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Home />);
    const btn = screen.getByText("CV");
    btn.click();
    await screen.findByText("Generating...");
    await screen.findByText("CV");
    expect(consoleSpy).toHaveBeenCalledWith("CV generation failed:", expect.any(Error));
    consoleSpy.mockRestore();
  });
});
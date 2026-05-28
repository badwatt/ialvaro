import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { Home } from "src/views/Home";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createObserverMock } from "./helpers/observerMock";
import { testExperienceData, testAboutData } from "./fixtures";

vi.mock("src/utils/generateCV", () => ({
  generateAndOpenCV: vi.fn().mockResolvedValue(undefined),
}));

describe("<Home />", () => {
  let observer: ReturnType<typeof createObserverMock>;

  beforeEach(() => {
    observer = createObserverMock();
  });
  afterEach(cleanup);

  it("should render hero name with scramble wobble", () => {
    render(<Home experienceData={testExperienceData} aboutData={testAboutData} />);
    expect(screen.getByLabelText("ALVARO")).toBeDefined();
    expect(screen.getByLabelText("GARCIA")).toBeDefined();
    expect(screen.getByLabelText("MACIAS")).toBeDefined();
  });

  it("should render CTAs", () => {
    render(<Home experienceData={testExperienceData} aboutData={testAboutData} />);
    expect(screen.getByText("View work")).toBeDefined();
    expect(screen.getByText("CV")).toBeDefined();
  });

  it("should render tagline", () => {
    render(<Home experienceData={testExperienceData} aboutData={testAboutData} />);
    expect(screen.getByText("Full Stack Developer")).toBeDefined();
    expect(screen.getByText(/Building interfaces that move/i)).toBeDefined();
  });

  it("updates parallax on scroll", () => {
    render(<Home experienceData={testExperienceData} aboutData={testAboutData} />);
    vi.spyOn(window, "scrollY", "get").mockReturnValue(500);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(screen.getByAltText("Alvaro Garcia Macias").style.transform).toContain(
      "translateY(60px)",
    );
  });

  it("reveals tagline when visible", () => {
    render(<Home experienceData={testExperienceData} aboutData={testAboutData} />);
    const tagline = screen.getByText(/Building interfaces that move/i).closest("p");
    expect(tagline?.className).toContain("opacity-0");
    act(() => {
      observer.callback([{ isIntersecting: true }]);
    });
    expect(tagline?.className).toContain("opacity-100");
  });

  it("opens CV via generateAndOpenCV", async () => {
    const { generateAndOpenCV } = await import("src/utils/generateCV");
    render(<Home experienceData={testExperienceData} aboutData={testAboutData} />);
    act(() => {
      screen.getByText("CV").click();
    });
    await waitFor(() => {
      expect(generateAndOpenCV).toHaveBeenCalled();
    });
  });

  it("shows generating state while loading", async () => {
    const { generateAndOpenCV } = await import("src/utils/generateCV");
    vi.mocked(generateAndOpenCV).mockImplementationOnce(
      () => new Promise((r) => setTimeout(r, 50))
    );
    render(<Home experienceData={testExperienceData} aboutData={testAboutData} />);
    act(() => {
      screen.getByText("CV").click();
    });
    expect(await screen.findByText("Generating...")).toBeDefined();
    await screen.findByText("CV");
  });

  it("handles CV generation failure gracefully", async () => {
    const { generateAndOpenCV } = await import("src/utils/generateCV");
    vi.mocked(generateAndOpenCV).mockRejectedValueOnce(new Error("fail"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Home experienceData={testExperienceData} aboutData={testAboutData} />);
    act(() => {
      screen.getByText("CV").click();
    });
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("CV generation failed:", expect.any(Error));
    });
    consoleSpy.mockRestore();
  });

  it("matches snapshot", () => {
    const { container } = render(<Home experienceData={testExperienceData} aboutData={testAboutData} />);
    expect(container).toMatchSnapshot();
  });
});

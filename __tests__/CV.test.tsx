import { cleanup, render, screen, waitFor, act } from "@testing-library/react";
import { CV } from "src/views/CV";
import { afterEach, describe, expect, it, vi } from "vitest";
import { testExperienceData, testAboutData, testSkillsData } from "./fixtures";

vi.mock("src/utils/generateCV", () => ({
  generateAndOpenCV: vi.fn().mockResolvedValue(undefined),
}));

describe("<CV />", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders heading", () => {
    render(<CV experienceData={testExperienceData} aboutData={testAboutData} skillsData={testSkillsData} />);
    expect(screen.getByText("Check out my CV")).toBeDefined();
  });

  it("renders section with correct id", () => {
    const { container } = render(<CV experienceData={testExperienceData} aboutData={testAboutData} skillsData={testSkillsData} />);
    expect(container.querySelector("#cv")).toBeDefined();
  });

  it("renders open button", () => {
    render(<CV experienceData={testExperienceData} aboutData={testAboutData} skillsData={testSkillsData} />);
    const btn = screen.getByLabelText("Open CV");
    expect(btn.tagName.toLowerCase()).toBe("button");
    expect(btn.getAttribute("type")).toBe("button");
  });

  it("renders icon", () => {
    const { container } = render(<CV experienceData={testExperienceData} aboutData={testAboutData} skillsData={testSkillsData} />);
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("shows generating state then returns to idle", async () => {
    const { generateAndOpenCV } = await import("src/utils/generateCV");
    vi.mocked(generateAndOpenCV).mockImplementationOnce(
      () => new Promise((r) => setTimeout(r, 50))
    );
    render(<CV experienceData={testExperienceData} aboutData={testAboutData} skillsData={testSkillsData} />);
    const btn = screen.getByLabelText("Open CV");
    act(() => {
      btn.click();
    });
    expect(await screen.findByText("Generating CV...")).toBeDefined();
    await screen.findByText("Check out my CV");
  });

  it("opens CV via generateAndOpenCV", async () => {
    const { generateAndOpenCV } = await import("src/utils/generateCV");
    render(<CV experienceData={testExperienceData} aboutData={testAboutData} skillsData={testSkillsData} />);
    act(() => {
      screen.getByLabelText("Open CV").click();
    });
    await waitFor(() => {
      expect(generateAndOpenCV).toHaveBeenCalled();
    });
  });

  it("handles PDF generation failure gracefully", async () => {
    const { generateAndOpenCV } = await import("src/utils/generateCV");
    vi.mocked(generateAndOpenCV).mockRejectedValueOnce(new Error("fail"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<CV experienceData={testExperienceData} aboutData={testAboutData} skillsData={testSkillsData} />);
    act(() => {
      screen.getByLabelText("Open CV").click();
    });
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("CV generation failed:", expect.any(Error));
    });
    consoleSpy.mockRestore();
  });

  it("matches snapshot", () => {
    const { container } = render(<CV experienceData={testExperienceData} aboutData={testAboutData} skillsData={testSkillsData} />);
    expect(container).toMatchSnapshot();
  });
});

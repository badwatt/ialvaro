import { cleanup, render, screen, waitFor, act } from "@testing-library/react";
import { CV } from "src/views/CV";
import { afterEach, describe, expect, it, vi } from "vitest";
import { testExperienceData, testAboutData, testSkillsData } from "./fixtures";

vi.mock("src/utils/generateCV", () => ({
  generateAndOpenCV: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("src/components/CapWidget", () => {
  const React = require("react");
  return {
    CapWidget: ({ onVerified }: { onVerified?: (token: string) => void }) => {
      return React.createElement(
        "button",
        { type: "button", onClick: () => onVerified?.("test-token") },
        "Verify",
      );
    },
  };
});

function setupFetchMock(ok = true) {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url === "/api/cap/verify") {
      return Promise.resolve({ ok, json: () => Promise.resolve({ ok }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
}

describe("<CV />", () => {
  beforeEach(() => {
    setupFetchMock();
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders heading", () => {
    render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    expect(screen.getByText("Check out my CV")).toBeDefined();
  });

  it("renders section with correct id", () => {
    const { container } = render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    expect(container.querySelector("#cv")).toBeDefined();
  });

  it("renders open button", () => {
    render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    const btn = screen.getByLabelText("Open CV");
    expect(btn.tagName.toLowerCase()).toBe("button");
    expect(btn.getAttribute("type")).toBe("button");
  });

  it("shows captcha widget after clicking", () => {
    render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    expect(screen.getByText("Check out my CV")).toBeDefined();
    act(() => {
      screen.getByLabelText("Open CV").click();
    });
    expect(screen.queryByText("Check out my CV")).toBeNull();
    expect(screen.getByText("Verify")).toBeDefined();
  });

  it("shows generating state then returns to idle", async () => {
    const { generateAndOpenCV } = await import("src/utils/generateCV");
    vi.mocked(generateAndOpenCV).mockImplementationOnce(
      () => new Promise((r) => setTimeout(r, 50)),
    );
    render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    act(() => {
      screen.getByLabelText("Open CV").click();
    });
    act(() => {
      screen.getByText("Verify").click();
    });
    expect(await screen.findByText("Generating CV...")).toBeDefined();
    await screen.findByText("Check out my CV");
  });

  it("opens CV via generateAndOpenCV after captcha resolves", async () => {
    const { generateAndOpenCV } = await import("src/utils/generateCV");
    render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    act(() => {
      screen.getByLabelText("Open CV").click();
    });
    act(() => {
      screen.getByText("Verify").click();
    });
    await waitFor(() => {
      expect(generateAndOpenCV).toHaveBeenCalled();
    });
  });

  it("handles PDF generation failure gracefully", async () => {
    const { generateAndOpenCV } = await import("src/utils/generateCV");
    vi.mocked(generateAndOpenCV).mockRejectedValueOnce(new Error("fail"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    act(() => {
      screen.getByLabelText("Open CV").click();
    });
    act(() => {
      screen.getByText("Verify").click();
    });
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("CV generation failed:", expect.any(Error));
    });
    consoleSpy.mockRestore();
  });

  it("shows captcha toast when verification fails", async () => {
    setupFetchMock(false);
    render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    act(() => {
      screen.getByLabelText("Open CV").click();
    });
    act(() => {
      screen.getByText("Verify").click();
    });
    await waitFor(() => {
      expect(screen.getByText(/Captcha verification failed/i)).toBeDefined();
    });
  });

  it("matches snapshot", () => {
    const { container } = render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});

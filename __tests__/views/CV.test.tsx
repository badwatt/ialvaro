import { cleanup, render, screen, waitFor, act } from "@testing-library/react";
import { CV } from "src/views/CV";
import { afterEach, describe, expect, it, vi } from "vitest";
import { testExperienceData, testAboutData, testSkillsData } from "../fixtures";
import toast from "react-hot-toast";
import { getThemeById } from "src/utils/cvThemes";

vi.mock("src/utils/generateCV", () => ({
  generateCV: vi.fn().mockResolvedValue("blob:test"),
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

function openPicker() {
  act(() => {
    screen.getByLabelText("Open CV").click();
  });
}

function pickTheme(name: string) {
  act(() => {
    screen.getByLabelText(`Select ${name} theme`).click();
  });
}

function verifyCaptcha() {
  act(() => {
    screen.getByText("Verify").click();
  });
}

function backToThemes() {
  act(() => {
    screen.getByText("Back to themes").click();
  });
}

describe("<CV />", () => {
  beforeEach(() => {
    const toaster = document.querySelector("[data-rht-toaster]");
    if (toaster) toaster.remove();
    setupFetchMock();
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    toast.remove();
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

  it("shows theme picker after clicking open", () => {
    render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    openPicker();
    expect(screen.queryByText("Check out my CV")).toBeNull();
    expect(screen.getByText("Pick a palette")).toBeDefined();
    expect(screen.getByLabelText("Select Default theme")).toBeDefined();
    expect(screen.getByLabelText("Select Classic White theme")).toBeDefined();
    expect(screen.getByLabelText("Select Catppuccin Mocha theme")).toBeDefined();
    expect(screen.getByLabelText("Select Emerald theme")).toBeDefined();
  });

  it("captcha is hidden while in the picker", () => {
    render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    openPicker();
    expect(screen.queryByText("Verify")).toBeNull();
  });

  it("selects a theme and advances to captcha", () => {
    render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    openPicker();
    pickTheme("Emerald");
    expect(screen.getByText("Verify")).toBeDefined();
    expect(screen.getByText("Back to themes")).toBeDefined();
  });

  it("captcha step shows the chosen theme name", () => {
    render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    openPicker();
    pickTheme("Catppuccin Mocha");
    expect(screen.getByLabelText("Selected theme: Catppuccin Mocha")).toBeDefined();
  });

  it("back-to-themes returns to the picker", () => {
    render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    openPicker();
    pickTheme("Default");
    backToThemes();
    expect(screen.getByText("Pick a palette")).toBeDefined();
    expect(screen.queryByText("Verify")).toBeNull();
  });

  it("shows generating state then opens PdfViewer", async () => {
    const { generateCV } = await import("src/utils/generateCV");
    vi.mocked(generateCV).mockImplementationOnce(
      () => new Promise((r) => setTimeout(() => r("blob:test"), 50)),
    );
    render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    openPicker();
    pickTheme("Default");
    verifyCaptcha();
    expect(await screen.findByText("Generating CV...")).toBeDefined();
    await waitFor(() => {
      expect(screen.getByTestId("pdf-canvas-container")).toBeDefined();
    });
  });

  it("passes the selected theme to generateCV", async () => {
    const { generateCV } = await import("src/utils/generateCV");
    render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    openPicker();
    pickTheme("Emerald");
    verifyCaptcha();
    await waitFor(() => {
      expect(generateCV).toHaveBeenCalled();
    });
    const calls = vi.mocked(generateCV).mock.calls;
    const lastCall = calls[calls.length - 1];
    const [theme, exp, about, skills] = lastCall;
    expect(theme).toEqual(getThemeById("emerald"));
    expect(exp).toBe(testExperienceData);
    expect(about).toBe(testAboutData);
    expect(skills).toBe(testSkillsData);
  });

  it("opens PdfViewer via generateCV after captcha resolves", async () => {
    const { generateCV } = await import("src/utils/generateCV");
    render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    openPicker();
    pickTheme("Default");
    verifyCaptcha();
    await waitFor(() => {
      expect(generateCV).toHaveBeenCalled();
      expect(screen.getByRole("dialog")).toBeDefined();
    });
  });

  it("handles PDF generation failure gracefully", async () => {
    const { generateCV } = await import("src/utils/generateCV");
    vi.mocked(generateCV).mockRejectedValueOnce(new Error("fail"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    openPicker();
    pickTheme("Default");
    verifyCaptcha();
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("CV generation failed:", expect.any(Error));
    });
    expect(screen.queryByRole("dialog")).toBeNull();
    // returns to captcha so user can retry
    expect(screen.getByText("Verify")).toBeDefined();
    consoleSpy.mockRestore();
  });

  it("shows captcha toast and returns to captcha step when verification fails", async () => {
    setupFetchMock(false);
    render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    openPicker();
    pickTheme("Default");
    verifyCaptcha();
    await waitFor(() => {
      expect(screen.getByText(/Captcha verification failed/i)).toBeDefined();
    });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText("Verify")).toBeDefined();
  });

  it("closes PdfViewer and revokes blob url", async () => {
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    openPicker();
    pickTheme("Default");
    verifyCaptcha();
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeDefined();
    });
    act(() => {
      screen.getByLabelText("Close preview").click();
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(revokeSpy).toHaveBeenCalledWith("blob:test");
    revokeSpy.mockRestore();
  });

  it("closes PdfViewer without revoking when url is empty", async () => {
    const { generateCV } = await import("src/utils/generateCV");
    vi.mocked(generateCV).mockResolvedValueOnce("");
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    render(
      <CV
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    openPicker();
    pickTheme("Default");
    verifyCaptcha();
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeDefined();
    });
    act(() => {
      screen.getByLabelText("Close preview").click();
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(revokeSpy).not.toHaveBeenCalled();
    revokeSpy.mockRestore();
  });
});

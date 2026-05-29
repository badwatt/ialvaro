import { cleanup, render, screen, waitFor, act } from "@testing-library/react";
import { CV } from "src/views/CV";
import { afterEach, describe, expect, it, vi } from "vitest";
import { testExperienceData, testAboutData, testSkillsData } from "../fixtures";
import toast from "react-hot-toast";

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

describe("<CV />", () => {
  beforeEach(() => {
    const toaster = document.querySelector('[data-rht-toaster]');
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
    act(() => {
      screen.getByLabelText("Open CV").click();
    });
    act(() => {
      screen.getByText("Verify").click();
    });
    expect(await screen.findByText("Generating CV...")).toBeDefined();
    await waitFor(() => {
      expect(screen.getByTestId("pdf-canvas-container")).toBeDefined();
    });
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
    act(() => {
      screen.getByLabelText("Open CV").click();
    });
    act(() => {
      screen.getByText("Verify").click();
    });
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
    act(() => {
      screen.getByLabelText("Open CV").click();
    });
    act(() => {
      screen.getByText("Verify").click();
    });
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("CV generation failed:", expect.any(Error));
    });
    expect(screen.queryByRole("dialog")).toBeNull();
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

  
  it("closes PdfViewer and revokes blob url", async () => {
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
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

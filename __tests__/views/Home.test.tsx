import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { Home } from "src/views/Home";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createObserverMock } from "../helpers/observerMock";
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

describe("<Home />", () => {
  let observer: ReturnType<typeof createObserverMock>;

  beforeEach(() => {
    const toaster = document.querySelector("[data-rht-toaster]");
    if (toaster) toaster.remove();
    observer = createObserverMock();
    setupFetchMock();
    vi.clearAllMocks();
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    toast.remove();
  });

  it("should render hero name with scramble wobble", () => {
    render(
      <Home
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    expect(screen.getByLabelText("ALVARO")).toBeDefined();
    expect(screen.getByLabelText("GARCIA")).toBeDefined();
    expect(screen.getByLabelText("MACIAS")).toBeDefined();
  });

  it("should render CTAs", () => {
    render(
      <Home
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    expect(screen.getByText("View work")).toBeDefined();
    expect(screen.getByText("CV")).toBeDefined();
  });

  it("should render tagline", () => {
    render(
      <Home
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    expect(screen.getByText("Full Stack Developer")).toBeDefined();
    expect(screen.getByText(/Building interfaces that move/i)).toBeDefined();
  });

  it("updates parallax on scroll", () => {
    render(
      <Home
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    vi.spyOn(window, "scrollY", "get").mockReturnValue(500);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(screen.getByAltText("Alvaro Garcia Macias").style.transform).toContain(
      "translateY(60px)",
    );
  });

  it("reveals tagline when visible", () => {
    render(
      <Home
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    const tagline = screen.getByText(/Building interfaces that move/i).closest("p");
    expect(tagline?.className).toContain("opacity-0");
    act(() => {
      observer.callback([{ isIntersecting: true }]);
    });
    expect(tagline?.className).toContain("opacity-100");
  });

  it("shows theme picker after clicking CV", () => {
    render(
      <Home
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    expect(screen.getByText("CV")).toBeDefined();
    act(() => {
      screen.getByText("CV").click();
    });
    expect(screen.queryByText("View work")).toBeNull();
    expect(screen.getByText("Pick a palette")).toBeDefined();
    expect(screen.queryByText("Verify")).toBeNull();
  });

  it("opens PdfViewer via generateCV after captcha resolves", async () => {
    const { generateCV } = await import("src/utils/generateCV");
    render(
      <Home
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    act(() => {
      screen.getByText("CV").click();
    });
    act(() => {
      screen.getByLabelText("Select Default theme").click();
    });
    act(() => {
      screen.getByText("Verify").click();
    });
    await waitFor(() => {
      expect(generateCV).toHaveBeenCalled();
      expect(screen.getByRole("dialog")).toBeDefined();
    });
  });

  it("shows generating state then opens PdfViewer", async () => {
    const { generateCV } = await import("src/utils/generateCV");
    vi.mocked(generateCV).mockImplementationOnce(
      () => new Promise((r) => setTimeout(() => r("blob:test"), 50)),
    );
    render(
      <Home
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    act(() => {
      screen.getByText("CV").click();
    });
    act(() => {
      screen.getByLabelText("Select Default theme").click();
    });
    act(() => {
      screen.getByText("Verify").click();
    });
    expect(await screen.findByText("Generating...")).toBeDefined();
    await waitFor(() => {
      expect(screen.getByTestId("pdf-canvas-container")).toBeDefined();
    });
  });

  it("handles PDF generation failure gracefully", async () => {
    const { generateCV } = await import("src/utils/generateCV");
    vi.mocked(generateCV).mockRejectedValueOnce(new Error("fail"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <Home
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    act(() => {
      screen.getByText("CV").click();
    });
    act(() => {
      screen.getByLabelText("Select Default theme").click();
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

  it("shows captcha toast and does not open modal when verification fails", async () => {
    setupFetchMock(false);
    render(
      <Home
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    act(() => {
      screen.getByText("CV").click();
    });
    act(() => {
      screen.getByLabelText("Select Default theme").click();
    });
    act(() => {
      screen.getByText("Verify").click();
    });
    await waitFor(() => {
      expect(screen.getByText(/Captcha verification failed/i)).toBeDefined();
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes PdfViewer and revokes blob url", async () => {
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    render(
      <Home
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    act(() => {
      screen.getByText("CV").click();
    });
    act(() => {
      screen.getByLabelText("Select Default theme").click();
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

  it("closes PdfViewer without revoking when url is empty", async () => {
    const { generateCV } = await import("src/utils/generateCV");
    vi.mocked(generateCV).mockResolvedValueOnce("");
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    render(
      <Home
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    act(() => {
      screen.getByText("CV").click();
    });
    act(() => {
      screen.getByLabelText("Select Default theme").click();
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
    expect(revokeSpy).not.toHaveBeenCalled();
    revokeSpy.mockRestore();
  });

  it("matches snapshot", () => {
    const { container } = render(
      <Home
        experienceData={testExperienceData}
        aboutData={testAboutData}
        skillsData={testSkillsData}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});

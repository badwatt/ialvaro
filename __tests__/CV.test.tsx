import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { pdf } from "@react-pdf/renderer";
import { CV } from "src/views/CV";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@react-pdf/renderer", async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  const toBlobMock = vi.fn().mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" }));
  return {
    ...actual,
    pdf: vi.fn().mockReturnValue({ toBlob: toBlobMock }),
  };
});

describe("<CV />", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders heading", () => {
    render(<CV />);
    expect(screen.getByText("Check out my CV")).toBeDefined();
  });

  it("renders section with correct id", () => {
    const { container } = render(<CV />);
    expect(container.querySelector("#cv")).toBeDefined();
  });

  it("renders open button", () => {
    render(<CV />);
    const btn = screen.getByLabelText("Open CV");
    expect(btn.tagName.toLowerCase()).toBe("button");
    expect(btn.getAttribute("type")).toBe("button");
  });

  it("renders icon", () => {
    const { container } = render(<CV />);
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("opens CV in new tab on click", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<CV />);
    const btn = screen.getByLabelText("Open CV");
    fireEvent.click(btn);

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith(expect.stringContaining("blob:"), "_blank");
    });

    openSpy.mockRestore();
  });

  it("shows generating state on click", async () => {
    render(<CV />);
    const btn = screen.getByLabelText("Open CV");
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText("Generating CV...")).toBeDefined();
    });
  });

  it("handles PDF generation failure gracefully", async () => {
    const pdfMock = vi.mocked(pdf);
    pdfMock.mockReturnValue({
      toBlob: vi.fn().mockRejectedValue(new Error("PDF fail")),
    } as unknown as ReturnType<typeof pdf>);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<CV />);
    const btn = screen.getByLabelText("Open CV");
    fireEvent.click(btn);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("CV generation failed:", expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it("matches snapshot", () => {
    const { container } = render(<CV />);
    expect(container).toMatchSnapshot();
  });
});
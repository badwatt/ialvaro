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

vi.mock("src/components/CVPreview", () => ({
  CVPreview: () => <div data-testid="cv-preview">CV Preview Mock</div>,
}));

describe("<CV />", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders preview heading", () => {
    render(<CV />);
    expect(screen.getByText("Preview my CV")).toBeDefined();
  });

  it("renders section with correct id", () => {
    const { container } = render(<CV />);
    expect(container.querySelector("#cv")).toBeDefined();
  });

  it("renders preview button", () => {
    render(<CV />);
    const btn = screen.getByLabelText("Preview CV");
    expect(btn.tagName.toLowerCase()).toBe("button");
    expect(btn.getAttribute("type")).toBe("button");
  });

  it("renders file icon", () => {
    const { container } = render(<CV />);
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("opens preview modal on click", async () => {
    render(<CV />);
    const btn = screen.getByLabelText("Preview CV");
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByTestId("cv-preview")).toBeDefined();
    });
  });

  it("handles PDF generation failure gracefully", async () => {
    const pdfMock = vi.mocked(pdf);
    pdfMock.mockReturnValue({
      toBlob: vi.fn().mockRejectedValue(new Error("PDF fail")),
    } as unknown as ReturnType<typeof pdf>);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<CV />);
    const btn = screen.getByLabelText("Preview CV");
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
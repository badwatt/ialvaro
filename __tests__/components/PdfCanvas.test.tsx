import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { PdfCanvas } from "src/components/PdfCanvas";

vi.mock("src/utils/renderPageToCanvas", () => ({
  renderPageToCanvas: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => ({
  getDocument: vi.fn().mockReturnValue({
    promise: Promise.resolve({
      numPages: 2,
      getPage: () => Promise.resolve({
        getViewport: () => ({ width: 595, height: 842 }),
        render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
        cleanup: vi.fn(),
      }),
    }),
    destroy: vi.fn(),
  }),
  GlobalWorkerOptions: { workerSrc: "" },
}));

describe("PdfCanvas", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders nothing when src is empty", () => {
    const { container } = render(<PdfCanvas src="" />);
    expect(container.innerHTML).toBe("");
  });

  it("calls getDocument and renders pages", async () => {
    const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
    render(<PdfCanvas src="blob:test" />);
    await waitFor(() => {
      expect(getDocument).toHaveBeenCalledWith("blob:test");
      expect(screen.queryByRole("status")).toBeNull();
    });
    expect(screen.getByTestId("pdf-canvas-container")).toBeDefined();
    const canvases = document.querySelectorAll("canvas");
    expect(canvases.length).toBe(2);
  });

  it("shows error on load failure", async () => {
    const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
    vi.mocked(getDocument).mockReturnValueOnce({
      promise: Promise.reject(new Error("fail")),
      destroy: vi.fn(),
    } as any);
    render(<PdfCanvas src="blob:test" />);
    await waitFor(() => {
      expect(screen.getByText("Failed to load PDF preview.")).toBeDefined();
    });
  });
});

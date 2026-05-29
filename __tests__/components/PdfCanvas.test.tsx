import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { PdfCanvas } from "src/components/PdfCanvas";

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

  it("shows loading spinner while loading", () => {
    render(<PdfCanvas src="blob:test" />);
    expect(screen.getByRole("status")).toBeDefined();
  });

  it("renders canvases with 2d context", async () => {
    const createEl = document.createElement.bind(document);
    document.createElement = (tag: string) => {
      const el = createEl(tag);
      if (tag === "canvas") {
        (el as HTMLCanvasElement).getContext = () => ({
          scale: vi.fn(),
          drawImage: vi.fn(),
        } as unknown as CanvasRenderingContext2D);
      }
      return el;
    };
    render(<PdfCanvas src="blob:test" />);
    await waitFor(() => {
      expect(screen.queryByRole("status")).toBeNull();
    });
    const canvases = document.querySelectorAll("canvas");
    expect(canvases.length).toBeGreaterThan(0);
    document.createElement = createEl;
  });

  it("cancels rendering on unmount", async () => {
    const { unmount } = render(<PdfCanvas src="blob:test" />);
    unmount();
    await new Promise((r) => setTimeout(r, 10));
    expect(screen.queryByTestId("pdf-canvas-container")).toBeNull();
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

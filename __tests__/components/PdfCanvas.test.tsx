import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
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

  it("applies zoom to canvas width", async () => {
    render(<PdfCanvas src="blob:test" zoom={1.5} />);
    await waitFor(() => {
      expect(screen.queryByRole("status")).toBeNull();
    });
    const canvases = document.querySelectorAll("canvas");
    expect(canvases.length).toBeGreaterThan(0);
    canvases.forEach((canvas) => {
      expect(canvas.style.width).toBe("150%");
    });
  });

  it("handles pinch zoom via touch events", async () => {
    const onZoomChange = vi.fn();
    render(<PdfCanvas src="blob:test" zoom={1} onZoomChange={onZoomChange} />);
    await waitFor(() => {
      expect(screen.queryByRole("status")).toBeNull();
    });

    const wrapper = screen.getByTestId("pdf-canvas-container").parentElement!;

    fireEvent.touchStart(wrapper, {
      touches: [
        { clientX: 0, clientY: 0 },
        { clientX: 100, clientY: 0 },
      ],
    });

    fireEvent.touchMove(wrapper, {
      touches: [
        { clientX: 0, clientY: 0 },
        { clientX: 200, clientY: 0 },
      ],
    });

    expect(onZoomChange).toHaveBeenCalled();
    const lastZoom = onZoomChange.mock.calls[onZoomChange.mock.calls.length - 1][0];
    expect(lastZoom).toBeGreaterThan(1);
    expect(lastZoom).toBeLessThanOrEqual(3);
  });
});

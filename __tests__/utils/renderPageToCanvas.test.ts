import { describe, it, expect, vi, afterEach } from "vitest";
import { renderPageToCanvas } from "src/utils/renderPageToCanvas";

describe("renderPageToCanvas", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("draws page to canvas with context", async () => {
    const canvas = document.createElement("canvas");
    const scaleSpy = vi.fn();
    const renderSpy = vi.fn().mockReturnValue({ promise: Promise.resolve() });
    (canvas as any).getContext = () =>
      ({ scale: scaleSpy } as unknown as CanvasRenderingContext2D);

    const page = {
      getViewport: () => ({ width: 100, height: 150 }),
      render: renderSpy,
    } as unknown as import("pdfjs-dist/legacy/build/pdf.mjs").PDFPageProxy;

    await renderPageToCanvas(page, canvas);

    expect(canvas.width).toBe(100);
    expect(canvas.height).toBe(150);
    expect(scaleSpy).toHaveBeenCalled();
    expect(renderSpy).toHaveBeenCalled();
  });

  it("returns early when getContext is null", async () => {
    const canvas = document.createElement("canvas");
    (canvas as any).getContext = () => null;

    const page = {
      getViewport: () => ({ width: 100, height: 150 }),
      render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
    } as unknown as import("pdfjs-dist/legacy/build/pdf.mjs").PDFPageProxy;

    await renderPageToCanvas(page, canvas);
    expect(page.render).not.toHaveBeenCalled();
  });

  it("uses devicePixelRatio when undefined", async () => {
    const orig = window.devicePixelRatio;
    vi.stubGlobal("devicePixelRatio", undefined);
    const canvas = document.createElement("canvas");
    (canvas as any).getContext = () =>
      ({ scale: vi.fn() } as unknown as CanvasRenderingContext2D);

    const page = {
      getViewport: () => ({ width: 50, height: 50 }),
      render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
    } as unknown as import("pdfjs-dist/legacy/build/pdf.mjs").PDFPageProxy;

    await renderPageToCanvas(page, canvas);
    expect(canvas.width).toBe(50);
    vi.stubGlobal("devicePixelRatio", orig);
  });
});

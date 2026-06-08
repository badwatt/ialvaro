import { describe, it, expect, vi, afterEach } from "vitest";
import { renderPageToCanvas } from "src/utils/renderPageToCanvas";

describe("renderPageToCanvas", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("draws page to canvas with context", async () => {
    const canvas = document.createElement("canvas");
    const renderSpy = vi.fn().mockReturnValue({ promise: Promise.resolve() });
    (canvas as any).getContext = () => ({}) as unknown as CanvasRenderingContext2D;

    const page = {
      getViewport: () => ({ width: 100, height: 150 }),
      render: renderSpy,
    } as unknown as import("pdfjs-dist/legacy/build/pdf.mjs").PDFPageProxy;

    await renderPageToCanvas(page, canvas);

    expect(canvas.width).toBe(100);
    expect(canvas.height).toBe(150);
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
    (canvas as any).getContext = () => ({ scale: vi.fn() }) as unknown as CanvasRenderingContext2D;

    const page = {
      getViewport: () => ({ width: 50, height: 50 }),
      render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
    } as unknown as import("pdfjs-dist/legacy/build/pdf.mjs").PDFPageProxy;

    await renderPageToCanvas(page, canvas);
    expect(canvas.width).toBe(50);
    vi.stubGlobal("devicePixelRatio", orig);
  });

  it("renders at scale matching containerWidth for crisp display", async () => {
    const origDpr = window.devicePixelRatio;
    vi.stubGlobal("devicePixelRatio", 1);
    const canvas = document.createElement("canvas");
    (canvas as any).getContext = () => ({ scale: vi.fn() }) as unknown as CanvasRenderingContext2D;

    const page = {
      getViewport: ({ scale }: { scale: number }) => ({
        width: 100 * scale,
        height: 150 * scale,
      }),
      render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
    } as unknown as import("pdfjs-dist/legacy/build/pdf.mjs").PDFPageProxy;

    // containerWidth 200, baseWidth 100, dpr 1 -> renderScale = 2 (no clamp)
    await renderPageToCanvas(page, canvas, 1, 200);

    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(300);
    vi.stubGlobal("devicePixelRatio", origDpr);
  });

  it("clamps render scale to MAX_RENDER_SCALE to prevent canvas errors at extreme DPRs", async () => {
    const origDpr = window.devicePixelRatio;
    vi.stubGlobal("devicePixelRatio", 2);
    const canvas = document.createElement("canvas");
    (canvas as any).getContext = () => ({ scale: vi.fn() }) as unknown as CanvasRenderingContext2D;

    const page = {
      getViewport: ({ scale }: { scale: number }) => ({
        width: 100 * scale,
        height: 150 * scale,
      }),
      render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
    } as unknown as import("pdfjs-dist/legacy/build/pdf.mjs").PDFPageProxy;

    // containerWidth 400 would give scale 8, clamped to 3 -> canvas 300x450
    await renderPageToCanvas(page, canvas, 1, 400);
    expect(canvas.width).toBe(300);
    expect(canvas.height).toBe(450);
    vi.stubGlobal("devicePixelRatio", origDpr);
  });

  it("resets canvas dimensions before render to clear error state", async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 9999;
    canvas.height = 9999;
    (canvas as any).getContext = () => ({ scale: vi.fn() }) as unknown as CanvasRenderingContext2D;

    const page = {
      getViewport: () => ({ width: 100, height: 150 }),
      render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
    } as unknown as import("pdfjs-dist/legacy/build/pdf.mjs").PDFPageProxy;

    await renderPageToCanvas(page, canvas, 1, 100);
    expect(canvas.width).toBe(100);
    expect(canvas.height).toBe(150);
  });
});

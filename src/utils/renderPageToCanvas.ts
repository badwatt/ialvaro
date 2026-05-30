import type { PDFPageProxy } from "pdfjs-dist/legacy/build/pdf.mjs";
import { PDF_SCALE } from "src/utils/pdfConstants";

export async function renderPageToCanvas(
  page: PDFPageProxy,
  canvas: HTMLCanvasElement,
  scale = PDF_SCALE,
) {
  const dpr = window.devicePixelRatio || 1;
  const viewport = page.getViewport({ scale });
  canvas.width = viewport.width * dpr;
  canvas.height = viewport.height * dpr;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  await page.render({ canvasContext: ctx, canvas, viewport }).promise;
}

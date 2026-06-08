import type { PDFPageProxy } from "pdfjs-dist/legacy/build/pdf.mjs";
import { PDF_SCALE } from "src/utils/pdfConstants";

const MAX_RENDER_SCALE = 3;

export async function renderPageToCanvas(
  page: PDFPageProxy,
  canvas: HTMLCanvasElement,
  scale = PDF_SCALE,
  containerWidth?: number,
) {
  const dpr = window.devicePixelRatio || 1;
  const baseViewport = page.getViewport({ scale: 1 });

  // Match rendered width to the container's CSS width for crisp display
  // at any screen size. Clamp to a safe maximum to avoid canvas errors
  // at extreme DPRs or container widths. Falls back to PDF_SCALE when
  // no width is provided.
  let renderScale = containerWidth ? (containerWidth / baseViewport.width) * dpr : scale * dpr;
  renderScale = Math.min(renderScale, MAX_RENDER_SCALE);

  const viewport = page.getViewport({ scale: renderScale });
  // Reset canvas before setting dimensions to clear any previous error state
  canvas.width = 0;
  canvas.height = 0;
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  await page.render({ canvasContext: ctx, canvas, viewport }).promise;
}
